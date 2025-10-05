import dayjs from "dayjs";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import {
    GetAiMonthlyUsageDto,
    GetAiMonthlyUsageResponse,
    UpdateAiMonthlyUsageDto,
} from "src/modules/source/dtos/GetAiMonthlyUsage";

@Injectable()
export class AiUsageService {
    constructor(
        private prismaService: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async getAiEmbeddingMonthlyUsage(payload: GetAiMonthlyUsageDto): Promise<GetAiMonthlyUsageResponse> {
        const now = dayjs();
        const cacheKey = `organization-${payload.organizationId}:ai-embedding:${now.format("MM-YYYY")}`;
        const cacheValue = await this.cacheManager.get<number>(cacheKey);

        let embeddingUsageThisMonth = 0;

        if (cacheValue) {
            embeddingUsageThisMonth = cacheValue;
        } else {
            const startDate = now.startOf("month").toDate();
            const endDate = now.endOf("month").toDate();

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

            embeddingUsageThisMonth = embeddingUsage._sum.tokensUsed ?? 0;

            const firstDayNextMonth = now.add(1, "month").startOf("month");
            const ttl = firstDayNextMonth.diff(now, "second");

            await this.cacheManager.set(cacheKey, embeddingUsageThisMonth, ttl);
        }

        return embeddingUsageThisMonth;
    }

    async getAiQueryMonthlyUsage(payload: GetAiMonthlyUsageDto): Promise<GetAiMonthlyUsageResponse> {
        const now = dayjs();
        const cacheKey = `organization-${payload.organizationId}:ai-query:${now.format("MM-YYYY")}`;
        const cacheValue = await this.cacheManager.get<number>(cacheKey);

        let queryUsageThisMonth = 0;

        if (cacheValue) {
            queryUsageThisMonth = cacheValue;
        } else {
            const startDate = now.startOf("month").toDate();
            const endDate = now.endOf("month").toDate();

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

            queryUsageThisMonth = queryUsage._sum.tokensUsed ?? 0;

            const firstDayNextMonth = now.add(1, "month").startOf("month");
            const ttl = firstDayNextMonth.diff(now, "second");

            await this.cacheManager.set(cacheKey, queryUsageThisMonth, ttl);
        }

        return queryUsageThisMonth;
    }

    async updateAiEmbeddingMonthlyUsage(payload: UpdateAiMonthlyUsageDto) {
        const now = dayjs();
        const cacheKey = `organization-${payload.organizationId}:ai-embedding:${now.format("MM-YYYY")}`;

        await this.cacheManager.set(cacheKey, payload.totalTokenCost);
    }

    async updateAiQueryMonthlyUsage(payload: UpdateAiMonthlyUsageDto) {
        const now = dayjs();
        const cacheKey = `organization-${payload.organizationId}:ai-query:${now.format("MM-YYYY")}`;

        await this.cacheManager.set(cacheKey, payload.totalTokenCost);
    }
}
