import { ApiKey } from "@prisma/client";
import { AllowedScope, OrgScope } from "src/types/OrgScope";
import * as z from "zod";

export const updateApiKeyBody = z.object({
    name: z.string(),
    scopes: z.array(AllowedScope).min(1, "scopes is required"),
});

export type UpdateApiKeyBody = z.infer<typeof updateApiKeyBody>;

export type UpdateApiKeyDto = UpdateApiKeyBody & {
    apiKeyId: number;
};

export type UpdateApiKeyResponse = Pick<ApiKey, "apiKeyId"> & {
    updatedAt: string;
};
