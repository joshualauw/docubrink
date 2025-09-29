import { Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { CreateSourceDto, CreateSourceResponse } from "src/modules/source/dtos/CreateSource";
import { QueueKey } from "src/types/QueueKey";

@Injectable()
export class SourceService {
    constructor(
        private prismaService: PrismaService,
        @InjectQueue(QueueKey.SOURCE) private sourceQueue: Queue,
    ) {}

    async create(payload: CreateSourceDto): Promise<CreateSourceResponse> {
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
}
