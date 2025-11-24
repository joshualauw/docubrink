import { OrganizationUser } from "@prisma/client";

export type GetAllOrganizationUserResponse = (Pick<OrganizationUser, "organizationUserId" | "role"> & {
    email: string;
    username: string;
    joinedAt: string;
})[];
