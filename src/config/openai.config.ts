import { registerAs } from "@nestjs/config";
import { EmbeddingModel, ResponsesModel } from "openai/resources";

export default registerAs("openai", () => ({
    apiKey: process.env.OPENAI_API_KEY || "sk-",
    baseModel: "o4-mini" as ResponsesModel,
    embeddingModel: "text-embedding-3-small" as EmbeddingModel,
}));
