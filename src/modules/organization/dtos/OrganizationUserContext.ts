import { OrganizationUser } from "@prisma/client";

export type OrganizationUserContext = Pick<
    OrganizationUser,
    "organizationUserId" | "organizationId" | "userId" | "role"
>;
