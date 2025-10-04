import { ApiKey } from "@prisma/client";

export type GetAllApiKeyResponse = Pick<ApiKey, "apiKeyId" | "name" | "isActive">[];
