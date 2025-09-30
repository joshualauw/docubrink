import { Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { CreateSourceDto, CreateSourceResponse } from "src/modules/source/dtos/CreateSource";
import { QueueKey } from "src/types/QueueKey";
import dayjs from "dayjs";
import { UpdateSourceDto, UpdateSourceResponse } from "src/modules/source/dtos/UpdateSource";
import { DeleteSourceDto, DeleteSourceResponse } from "src/modules/source/dtos/DeleteSource";
import { AskSourceDto, AskSourceResponse } from "src/modules/source/dtos/AskSource";
import { RetrievalService } from "src/modules/source/services/retrieval.service";
import { GetAllSourceDto, GetAllSourceResponse } from "src/modules/source/dtos/GetAllSource";
import { Prisma } from "@prisma/client";

@Injectable()
export class SourceService {
    constructor(
        private prismaService: PrismaService,
        private retrievalService: RetrievalService,
        @InjectQueue(QueueKey.SOURCE) private sourceQueue: Queue,
    ) {}

    async getAll(payload: GetAllSourceDto): Promise<GetAllSourceResponse> {
        const sources = await this.prismaService.source.findMany({
            where: { organizationId: payload.organizationId },
            include: {
                _count: {
                    select: {
                        sourceChunks: true,
                    },
                },
            },
        });

        return sources.map((s) => ({
            sourceId: s.sourceId,
            title: s.title,
            totalChunks: s._count.sourceChunks,
        }));
    }

    async create(payload: CreateSourceDto): Promise<CreateSourceResponse> {
        const subscription = await this.prismaService.subscription.findFirstOrThrow({
            where: { status: "ACTIVE", organizationId: payload.organizationId },
            select: {
                plan: { select: { maxSources: true, embeddingTokenLimit: true } },
            },
        });

        const sourcesCount = await this.prismaService.source.count({
            where: { organizationId: payload.organizationId },
        });

        if (subscription.plan.maxSources <= sourcesCount) {
            throw new BadRequestException("Maximum sources limit");
        }

        const startDate = dayjs().startOf("month").toDate();
        const endDate = dayjs().endOf("month").toDate();

        const embeddingUsage = await this.prismaService.aiEmbedding.aggregate({
            where: {
                organizationId: payload.organizationId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                tokensUsed: true,
            },
        });

        const embeddingUsageThisMonth = embeddingUsage._sum.tokensUsed ?? 0;

        if (subscription.plan.embeddingTokenLimit <= embeddingUsageThisMonth) {
            throw new BadRequestException("Embedding token limit");
        }

        const source = await this.prismaService.source.create({
            data: {
                organizationId: payload.organizationId,
                title: payload.title,
                rawText: payload.text,
                type: payload.type,
                status: "PROCESSING",
                metadata: payload.metadata,
            },
        });

        await this.sourceQueue.add(`source-${source.sourceId}`, source.sourceId, {
            attempts: 3,
            backoff: {
                type: "fixed",
                delay: 5000,
            },
        });

        return { sourceId: source.sourceId, createdAt: source.createdAt.toISOString() };
    }

    async update(payload: UpdateSourceDto): Promise<UpdateSourceResponse> {
        const source = await this.prismaService.source.update({
            where: { sourceId: payload.sourceId },
            data: { title: payload.title },
        });

        return { sourceId: source.sourceId, updatedAt: source.updatedAt.toISOString() };
    }

    async delete(payload: DeleteSourceDto): Promise<DeleteSourceResponse> {
        const source = await this.prismaService.source.delete({
            where: { sourceId: payload.sourceId },
        });

        return { sourceId: source.sourceId, timestamp: dayjs().toISOString() };
    }

    async ask(payload: AskSourceDto): Promise<AskSourceResponse> {
        const subscription = await this.prismaService.subscription.findFirstOrThrow({
            where: { status: "ACTIVE", organizationId: payload.organizationId },
            select: {
                plan: { select: { maxSources: true, queryTokenLimit: true } },
            },
        });

        const startDate = dayjs().startOf("month").toDate();
        const endDate = dayjs().endOf("month").toDate();

        const queryUsage = await this.prismaService.aiQuery.aggregate({
            where: {
                organizationId: payload.organizationId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                tokensUsed: true,
            },
        });

        const queryUsageThisMonth = queryUsage._sum.tokensUsed ?? 0;

        if (subscription.plan.queryTokenLimit <= queryUsageThisMonth) {
            throw new BadRequestException("Query token limit");
        }

        const sources = await this.prismaService.source.findMany({
            where: {
                organizationId: payload.organizationId,
                metadata: {
                    equals: payload.metadata,
                },
            },
            select: { sourceId: true },
        });

        const chunks = await this.retrievalService.vectorSearch(
            payload.query,
            sources.map((s) => s.sourceId),
        );

        const result = await this.retrievalService.generateAnswer(payload.query, chunks);

        await this.prismaService.aiQuery.create({
            data: {
                organizationId: payload.organizationId,
                queryText: payload.query,
                responseText: result.output,
                tokensUsed: result.tokenCost,
            },
        });

        return { answer: result.output, timestamp: dayjs().toISOString() };
    }
}
