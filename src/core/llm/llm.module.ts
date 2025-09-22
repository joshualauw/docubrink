import { Module } from "@nestjs/common";
import { OpenAiService } from "src/core/llm/openai/openai.service";

@Module({
    providers: [OpenAiService],
    exports: [OpenAiService],
})
export class LlmModule {}