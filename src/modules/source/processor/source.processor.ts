import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { PrismaService } from "nestjs-prisma";
import { ChunkingService } from "src/modules/source/services/chunking.service";
import { QueueKey } from "src/types/QueueKey";

@Processor(QueueKey.SOURCE)
export class SourceProcessor extends WorkerHost {
    private logger = new Logger(SourceProcessor.name);

    constructor(
        private prismaService: PrismaService,
        private chunkingService: ChunkingService,
    ) {
        super();
    }

    async process(job: Job<number>): Promise<void> {
        try {
            const source = await this.prismaService.source.findFirstOrThrow({
                where: { sourceId: job.data },
            });

            const cleanedText = this.chunkingService.cleanText(source.rawText);
            const { chunks, tokenCost } = await this.chunkingService.createChunks(cleanedText);

            const tempValues: any[] = [];
            const placeholders: string[] = [];

            await this.prismaService.$transaction(async (tx) => {
                for (let i = 0; i < chunks.length; i++) {
                    const offset = i * 3;
                    tempValues.push(source.sourceId, chunks[i].content, chunks[i].embedding);
                    placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
                }

                const query = `
                    INSERT INTO public."SourceChunk" ("sourceId", "chunkText", embedding)
                    VALUES ${placeholders.join(", ")}
                `;

                await tx.$executeRawUnsafe(query, ...tempValues);

                await tx.aiEmbedding.updateMany({
                    where: { sourceId: job.data },
                    data: { tokensUsed: tokenCost, status: "DONE" },
                });
            });
        } catch (e: any) {
            this.logger.error(`job ${job.id} failed`, e.message);

            await this.prismaService.$transaction(async (tx) => {
                await tx.aiEmbedding.updateMany({
                    where: { sourceId: job.data },
                    data: { status: "FAILED", sourceId: null },
                });

                await tx.source.delete({
                    where: { sourceId: job.data },
                });
            });
        }
    }
}
