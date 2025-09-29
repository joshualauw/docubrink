import { zodTextFormat } from "openai/helpers/zod";
import { ZodSchema } from "zod";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import OpenAI from "openai";
import openaiConfig from "src/config/openai.config";
import { EmbedChunksResult } from "src/core/llm/openai/dtos/EmbedChunks";

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

    async getTextResponse(prompt: string): Promise<string> {
        const result = await this.client.responses.create({
            model: this.openaiCfg.baseModel,
            input: prompt,
        });

        return result.output_text;
    }

    async getStructuredResponse<T>(prompt: string, format: ZodSchema): Promise<T> {
        const schema = zodTextFormat(format, "json");

        const result = await this.client.responses.parse({
            model: this.openaiCfg.baseModel,
            input: prompt,
            text: { format: schema },
        });

        return result.output_parsed as T;
    }
}
