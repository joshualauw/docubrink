import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Injectable } from "@nestjs/common";
import { OpenAiService } from "src/core/llm/openai/openai.service";
import { CreateChunkResult } from "src/modules/source/dtos/CreateChunks";

@Injectable()
export class ChunkingService {
    private readonly CHUNK_SIZE = 400;
    private readonly CHUNK_OVERLAP = 40;

    constructor(private openaiService: OpenAiService) {}

    cleanText(rawText: string): string {
        return rawText
            .replace(/[ \t]+/g, " ") // normalize spaces
            .replace(/\r\n/g, "\n") // unify line breaks
            .replace(/\n{2,}/g, "\n\n") // max 1 newline (preserve paragraph)
            .replace(/\.{2,}/g, ".") // remove extra dots
            .replace(/[^\x00-\x7F]+/g, "") // optional: remove non-ASCII
            .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1") // remove **bold**, *italic*, etc
            .replace(/`{1,3}([^`]+)`{1,3}/g, "$1") // remove inline or fenced code
            .replace(/^#+\s?/gm, "") // strip markdown headers
            .replace(/^\s*[-*+]\s+/gm, "") // strip list markers
            .replace(/<[^>]+>/g, "") // strip all HTML tags
            .replace(/[-_*]{3,}/g, "") // strip ASCII dividers
            .trim();
    }

    async createChunks(text: string): Promise<CreateChunkResult> {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: this.CHUNK_SIZE,
            chunkOverlap: this.CHUNK_OVERLAP,
            separators: [". ", "\n\n", "\n", " ", ""],
        });

        const docs = await splitter.createDocuments([text]);
        const cleanedDocs = docs.map((doc) =>
            doc.pageContent
                .replace(/^\.\s*/, "")
                .replace(/\s+/g, " ")
                .trim(),
        );

        const vector = await this.openaiService.embedChunks(cleanedDocs);

        return {
            tokenCost: vector.tokenCost,
            chunks: cleanedDocs.map((d, i) => ({
                content: d,
                embedding: vector.embeddings[i],
            })),
        };
    }
}
