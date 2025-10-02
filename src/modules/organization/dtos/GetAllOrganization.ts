import { Organization } from "@prisma/client";

export type GetAllOrganizationResponse = Pick<Organization, "organizationId" | "name">[];
