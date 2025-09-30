import { zodTextFormat } from "openai/helpers/zod";
import { ZodSchema } from "zod";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import OpenAI from "openai";
import openaiConfig from "src/config/openai.config";
import { EmbedChunksResult } from "src/core/llm/openai/dtos/EmbedChunks";
import { QueryResponseResult } from "src/core/llm/openai/dtos/QueryResponse";

@Injectable()
export class OpenAiService {
    private readonly openai: OpenAI;

    constructor(@Inject(openaiConfig.KEY) private openaiCfg: ConfigType<typeof openaiConfig>) {
        this.openai = new OpenAI({
            apiKey: this.openaiCfg.apiKey,
        });
    }

    get client(): OpenAI {
        return this.openai;
    }

    async embedChunks(inputs: string[]): Promise<EmbedChunksResult> {
        const result = await this.client.embeddings.create({
            model: this.openaiCfg.embeddingModel,
            input: inputs,
        });

        return {
            embeddings: result.data.map((d) => d.embedding),
            tokenCost: result.usage.total_tokens,
        };
    }

    async getTextResponse(prompt: string): Promise<QueryResponseResult<string>> {
        const result = await this.client.responses.create({
            model: this.openaiCfg.baseModel,
            input: prompt,
        });

        return {
            output: result.output_text,
            tokenCost: result.usage?.total_tokens ?? 0,
        };
    }

    async getStructuredResponse<T>(prompt: string, format: ZodSchema): Promise<QueryResponseResult<T>> {
        const schema = zodTextFormat(format, "json");

        const result = await this.client.responses.parse({
            model: this.openaiCfg.baseModel,
            input: prompt,
            text: { format: schema },
        });

        return {
            output: result.output_parsed as T,
            tokenCost: result.usage?.total_tokens ?? 0,
        };
    }
}
