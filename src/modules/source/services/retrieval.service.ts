import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { QueryResponseResult } from "src/core/llm/openai/dtos/QueryResponse";
import { OpenAiService } from "src/core/llm/openai/openai.service";
import { VectorSearchItem, VectorSearchResult } from "src/modules/source/dtos/VectorSearch";

@Injectable()
export class RetrievalService {
    private readonly VS_THRESHOLD = 0.8;
    private readonly CHUNK_LIMIT = 5;

    constructor(
        private openaiService: OpenAiService,
        private prismaService: PrismaService,
    ) {}

    async vectorSearch(query: string, sourceIds: number[]): Promise<VectorSearchResult> {
        const vectors = await this.openaiService.embedChunks([query]);
        const vector = vectors.embeddings[0];
        const vectorString = `[${vector.join(",")}]`;

        return await this.prismaService.$queryRaw`
            SELECT "sourceChunkId", "chunkText", embedding <=> ${vectorString}::vector AS score 
            FROM public."SourceChunk"
            WHERE "sourceId" = ANY(${sourceIds}::int[]) 
            AND embedding <=> ${vectorString}::vector < ${this.VS_THRESHOLD}
            ORDER BY score
            LIMIT ${this.CHUNK_LIMIT}
        `;
    }

    async generateAnswer(query: string, chunks: VectorSearchItem[]): Promise<QueryResponseResult<string>> {
        const prompt = `
            You are an AI assistant with access to external knowledge. Use the retrieved context provided to 
            answer the user’s query accurately. 

            RULES:
            - Always ground your response in the retrieved context. 
            - If the context does not contain the answer, say so and provide your best reasoning based on your 
              general knowledge. 
            - Do not fabricate details. 
            - Use human friendly language
            - Be clear, concise, and structured in your response.
            - Maximum 750 words

            RETRIEVED CONTEXT:
            ${chunks.map((c) => `- ${c.chunkText}`)}

            USER QUERY:
            ${query}
        `;

        return await this.openaiService.getTextResponse(prompt);
    }
}
