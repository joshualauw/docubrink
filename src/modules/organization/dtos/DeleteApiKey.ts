import { ApiKey } from "@prisma/client";

export type DeleteApiKeyDto = Pick<ApiKey, "apiKeyId">;

export type DeleteApiKeyResponse = Pick<ApiKey, "apiKeyId"> & {
    deletedAt: string;
};
