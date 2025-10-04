import { ApiKey } from "@prisma/client";
import { AllowedScope } from "src/types/ApiKeyScope";
import z from "zod";

export const createApiKeyBody = z.object({
    name: z.string(),
    scopes: z.array(AllowedScope).min(1, "scopes is required"),
});

export type CreateApiKeyBody = z.infer<typeof createApiKeyBody>;

export type CreateApiKeyDto = CreateApiKeyBody;

export type CreateApiKeyResponse = Pick<ApiKey, "apiKeyId"> & {
    generatedKey: string;
    createdAt: string;
};
