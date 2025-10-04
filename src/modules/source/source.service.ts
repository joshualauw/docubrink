import dayjs from "dayjs";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { CreateSourceDto, CreateSourceResponse } from "src/modules/source/dtos/CreateSource";
import { UpdateSourceDto, UpdateSourceResponse } from "src/modules/source/dtos/UpdateSource";
import { DeleteSourceDto, DeleteSourceResponse } from "src/modules/source/dtos/DeleteSource";
import { AskSourceDto, AskSourceResponse } from "src/modules/source/dtos/AskSource";
import { RetrievalService } from "src/modules/source/services/retrieval.service";
import { GetAllSourceResponse } from "src/modules/source/dtos/GetAllSource";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { ChunkingService } from "src/modules/source/services/chunking.service";
import { GetDetailSourceDto, GetDetailSourceResponse } from "src/modules/source/dtos/GetDetailSource";
import { OrganizationContextService } from "src/modules/organization/services/organization-context.service";

@Injectable()
export class SourceService {
    constructor(
        private prismaService: PrismaService,
        private retrievalService: RetrievalService,
        private chunkingService: ChunkingService,
        private organizationContextService: OrganizationContextService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

        const source = await this.prismaService.source.findFirstOrThrow({
            where: { sourceId: payload.sourceId, organizationId },
            select: { sourceId: true, title: true, rawText: true, type: true, metadata: true },
        });

        return source;
    }

    async create(payload: CreateSourceDto): Promise<CreateSourceResponse> {
        const organizationId = this.organizationContextService.get();

        const subscription = await this.prismaService.subscription.findFirstOrThrow({
            where: { status: "ACTIVE", organizationId },
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

        const now = dayjs();

        const cacheKey = `organization-${organizationId}:ai-embedding:${now.format("MM-YYYY")}`;
        const cacheValue = await this.cacheManager.get<number>(cacheKey);

        let embeddingUsageThisMonth = 0;

        if (cacheValue) {
            embeddingUsageThisMonth = cacheValue;
        } else {
            const startDate = now.startOf("month").toDate();
            const endDate = now.endOf("month").toDate();

            const embeddingUsage = await this.prismaService.aiEmbedding.aggregate({
                where: {
                    organizationId,
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _sum: {
                    tokensUsed: true,
                },
            });

            embeddingUsageThisMonth = embeddingUsage._sum.tokensUsed ?? 0;

            const firstDayNextMonth = now.add(1, "month").startOf("month");
            const ttl = firstDayNextMonth.diff(now, "second");

            await this.cacheManager.set(cacheKey, embeddingUsageThisMonth, ttl);
        }

        const cleanedText = this.chunkingService.cleanText(payload.text);
        const result = await this.chunkingService.createChunks(`${cleanedText}`);

        const totalTokenCost = embeddingUsageThisMonth + result.tokenCost;

        if (subscription.plan.embeddingTokenLimit <= totalTokenCost) {
            throw new BadRequestException("Embedding token limit");
        }

        const tempValues: any[] = [];
        const placeholders: string[] = [];

        const source = await this.prismaService.$transaction(async (tx) => {
            const source = await this.prismaService.source.create({
                data: {
                    organizationId,
                    title: payload.title,
                    rawText: payload.text,
                    type: payload.type,
                    status: "DONE",
                    metadata: payload.metadata,
                },
            });

            for (let i = 0; i < result.chunks.length; i++) {
                const offset = i * 3;
                tempValues.push(source.sourceId, result.chunks[i].content, result.chunks[i].embedding);
                placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
            }

            const query = `
                INSERT INTO public."SourceChunk" ("sourceId", "chunkText", embedding)
                VALUES ${placeholders.join(", ")}
            `;

            await tx.$executeRawUnsafe(query, ...tempValues);

            return source;
        });

        await this.prismaService.aiEmbedding.create({
            data: {
                sourceId: source.sourceId,
                organizationId: source.organizationId,
                tokensUsed: result.tokenCost,
            },
        });

        await this.cacheManager.set(cacheKey, totalTokenCost);

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
            where: { status: "ACTIVE", organizationId },
            select: {
                plan: { select: { maxSources: true, queryTokenLimit: true } },
            },
        });

        const now = dayjs();

        const cacheKey = `organization-${organizationId}:ai-query:${now.format("MM-YYYY")}`;
        const cacheValue = await this.cacheManager.get<number>(cacheKey);

        let queryUsageThisMonth = 0;

        if (cacheValue) {
            queryUsageThisMonth = cacheValue;
        } else {
            const startDate = now.startOf("month").toDate();
            const endDate = now.endOf("month").toDate();

            const queryUsage = await this.prismaService.aiQuery.aggregate({
                where: {
                    organizationId,
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _sum: {
                    tokensUsed: true,
                },
            });

            queryUsageThisMonth = queryUsage._sum.tokensUsed ?? 0;

            const firstDayNextMonth = now.add(1, "month").startOf("month");
            const ttl = firstDayNextMonth.diff(now, "second");

            await this.cacheManager.set(cacheKey, queryUsageThisMonth, ttl);
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
        const totalTokenCost = queryUsageThisMonth + result.tokenCost;

        if (subscription.plan.queryTokenLimit <= totalTokenCost) {
            throw new BadRequestException("Query token limit");
        }

        await this.prismaService.aiQuery.create({
            data: {
                organizationId,
                queryText: payload.query,
                responseText: result.output,
                tokensUsed: result.tokenCost,
            },
        });

        await this.cacheManager.set(cacheKey, totalTokenCost);

        return { answer: result.output, timestamp: dayjs().toISOString() };
    }
}
