import { ApiKey } from "@prisma/client";

export type GetDetailApiKeyDto = Pick<ApiKey, "apiKeyId">;

export type GetDetailApiKeyResponse = Pick<ApiKey, "apiKeyId" | "name" | "isActive" | "scopes">;
