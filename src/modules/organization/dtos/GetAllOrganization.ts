import { Organization, OrganizationUser } from "@prisma/client";

export type GetAllOrganizationResponse = (Pick<Organization, "organizationId" | "name"> &
    Pick<OrganizationUser, "role">)[];
