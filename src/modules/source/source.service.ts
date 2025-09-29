import { Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { CreateSourceDto, CreateSourceResponse } from "src/modules/source/dtos/CreateSource";
import { QueueKey } from "src/types/QueueKey";
import dayjs from "dayjs";
import { UpdateSourceDto, UpdateSourceResponse } from "src/modules/source/dtos/UpdateSource";
import { DeleteSourceDto, DeleteSourceResponse } from "src/modules/source/dtos/DeleteSource";

@Injectable()
export class SourceService {
    constructor(
        private prismaService: PrismaService,
        @InjectQueue(QueueKey.SOURCE) private sourceQueue: Queue,
    ) {}

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
                aiEmbedding: {
                    create: {
                        organizationId: payload.organizationId,
                        tokensUsed: 0,
                        status: "PROCESSING",
                    },
                },
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

        return { sourceId: source.sourceId, deletedAt: dayjs().toISOString() };
    }
}
