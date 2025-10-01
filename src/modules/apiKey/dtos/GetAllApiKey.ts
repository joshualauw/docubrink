import { ApiKey, Organization } from "@prisma/client";

export type GetAllApiKeyDto = Pick<Organization, "organizationId">;

export type GetAllApiKeyResponse = Pick<ApiKey, "apiKeyId" | "name" | "isActive">[];
