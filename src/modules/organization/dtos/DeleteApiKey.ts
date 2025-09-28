import { ApiKey } from "@prisma/client";

export type DeleteApiKeyDto = {
    apiKeyId: number;
};

export type DeleteApiKeyResponse = Pick<ApiKey, "apiKeyId">;
