import { registerAs } from "@nestjs/config";
import { ResponsesModel } from "openai/resources";

export default registerAs("openai", () => ({
    apiKey: process.env.OPENAI_API_KEY || "sk-",
    baseModel: "o4-mini" as ResponsesModel,
}));
