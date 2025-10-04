import { OrganizationUser } from "@prisma/client";

export type GetAllOrganizationUserResponse = (Pick<OrganizationUser, "organizationUserId" | "role"> & {
    username: string;
    joinedAt: string;
})[];
