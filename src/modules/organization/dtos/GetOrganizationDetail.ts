import { Organization, OrganizationUser } from "@prisma/client";

export type GetOrganizationDetailDto = Pick<Organization, "organizationId">;

export type GetOrganizationDetailResponse = Pick<Organization, "organizationId" | "name"> &
    Pick<OrganizationUser, "role">;
