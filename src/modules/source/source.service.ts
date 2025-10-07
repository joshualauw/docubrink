import dayjs from "dayjs";
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { CreateSourceDto, CreateSourceResponse } from "src/modules/source/dtos/CreateSource";
import { UpdateSourceDto, UpdateSourceResponse } from "src/modules/source/dtos/UpdateSource";
import { DeleteSourceDto, DeleteSourceResponse } from "src/modules/source/dtos/DeleteSource";
import { AskSourceDto, AskSourceResponse } from "src/modules/source/dtos/AskSource";
import { RetrievalService } from "src/modules/source/services/retrieval.service";
import { GetAllSourceResponse } from "src/modules/source/dtos/GetAllSource";
import { GetDetailSourceDto, GetDetailSourceResponse } from "src/modules/source/dtos/GetDetailSource";
import { OrganizationContextService } from "src/modules/organization/services/organization-context.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { QueueKey } from "src/types/QueueKey";
import { AiUsageService } from "src/modules/source/services/ai-usage.service";
import { LocalStorageService } from "src/core/storage/local/local-storage.service";
import FileParserService from "src/modules/source/services/file-parser.service";
import { EmbeddingJobDto } from "src/modules/source/dtos/EmbeddingJob";

@Injectable()
export class SourceService {
    constructor(
        private prismaService: PrismaService,
        private retrievalService: RetrievalService,
        private organizationContextService: OrganizationContextService,
        private aiUsageService: AiUsageService,
        private localStorageService: LocalStorageService,
        private fileParserService: FileParserService,
        @InjectQueue(QueueKey.SOURCE) private queue: Queue,
    ) {}

    async getAll(): Promise<GetAllSourceResponse> {
        const organizationId = this.organizationContextService.get();

        const sources = await this.prismaService.source.findMany({
            where: { organizationId },
            select: {
                sourceId: true,
                title: true,
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

    async getDetail(payload: GetDetailSourceDto): Promise<GetDetailSourceResponse> {
        const organizationId = this.organizationContextService.get();

        return this.prismaService.source.findFirstOrThrow({
            where: { sourceId: payload.sourceId, organizationId },
            select: { sourceId: true, title: true, rawText: true, type: true, metadata: true },
        });
    }

    async create(payload: CreateSourceDto): Promise<CreateSourceResponse> {
        const organizationId = this.organizationContextService.get();

        const subscription = await this.prismaService.subscription.findFirstOrThrow({
            where: { isActive: true, organizationId },
            select: {
                plan: { select: { maxSources: true, embeddingTokenLimit: true } },
            },
        });

        const sourcesCount = await this.prismaService.source.count({
            where: { organizationId },
        });

        if (subscription.plan.maxSources <= sourcesCount) {
            throw new BadRequestException("Maximum sources limit");
        }

        const embeddingUsageThisMonth = await this.aiUsageService.getAiEmbeddingMonthlyUsage({
            organizationId,
        });

        if (subscription.plan.embeddingTokenLimit <= embeddingUsageThisMonth) {
            throw new BadRequestException("Embedding token limit");
        }

        let rawText = "";
        let fileUrl: string | null = null;

        if (payload.text && payload.type == "MANUAL") {
            rawText = payload.text;
        } else if (payload.file && payload.type == "UPLOAD") {
            rawText = await this.fileParserService.parse(payload.file);
            fileUrl = await this.localStorageService.writeFile(payload.file);
        }

        const source = await this.prismaService.source.create({
            data: {
                organizationId,
                title: payload.title,
                rawText,
                fileUrl,
                type: payload.type,
                status: "PROCESSING",
                metadata: payload.metadata,
            },
        });

        const jobData: EmbeddingJobDto = { sourceId: source.sourceId, embeddingUsageThisMonth };

        await this.queue.add("create-source", jobData, {
            attempts: 3,
            backoff: {
                type: "fixed",
                delay: 5000,
            },
        });

        return { sourceId: source.sourceId, createdAt: source.createdAt.toISOString() };
    }

    async update(payload: UpdateSourceDto): Promise<UpdateSourceResponse> {
        const organizationId = this.organizationContextService.get();

        const source = await this.prismaService.source.update({
            where: { sourceId: payload.sourceId, organizationId },
            data: { title: payload.title },
        });

        return { sourceId: source.sourceId, updatedAt: source.updatedAt.toISOString() };
    }

    async delete(payload: DeleteSourceDto): Promise<DeleteSourceResponse> {
        const organizationId = this.organizationContextService.get();

        const source = await this.prismaService.source.delete({
            where: { sourceId: payload.sourceId, organizationId },
        });

        return { sourceId: source.sourceId, timestamp: dayjs().toISOString() };
    }

    async ask(payload: AskSourceDto): Promise<AskSourceResponse> {
        const organizationId = this.organizationContextService.get();

        const subscription = await this.prismaService.subscription.findFirstOrThrow({
            where: { isActive: true, organizationId },
            select: {
                plan: { select: { maxSources: true, queryTokenLimit: true } },
            },
        });

        const queryUsageThisMonth = await this.aiUsageService.getAiQueryMonthlyUsage({ organizationId });

        if (subscription.plan.queryTokenLimit <= queryUsageThisMonth) {
            throw new BadRequestException("Query token limit");
        }

        const sources = await this.prismaService.source.findMany({
            where: {
                organizationId,
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
                organizationId,
                queryText: payload.query,
                responseText: result.output,
                tokensUsed: result.tokenCost,
            },
        });

        const totalTokenCost = queryUsageThisMonth + result.tokenCost;

        await this.aiUsageService.updateAiQueryMonthlyUsage({ organizationId, totalTokenCost });

        return { answer: result.output, timestamp: dayjs().toISOString() };
    }
}
