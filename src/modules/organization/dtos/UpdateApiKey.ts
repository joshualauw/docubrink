import { ApiKey } from "@prisma/client";
import { AllowedScope } from "src/types/OrgScope";
import z from "zod";

export const updateApiKeyBody = z.object({
    name: z.string().min(1, "name is required"),
    scopes: z.array(AllowedScope).min(1, "scopes is required"),
    isActive: z.boolean({ message: "isActive is required" }),
});

export type UpdateApiKeyBody = z.infer<typeof updateApiKeyBody>;

export type UpdateApiKeyDto = UpdateApiKeyBody & {
    apiKeyId: number;
};

export type UpdateApiKeyResponse = Pick<ApiKey, "apiKeyId"> & {
    updatedAt: string;
};
