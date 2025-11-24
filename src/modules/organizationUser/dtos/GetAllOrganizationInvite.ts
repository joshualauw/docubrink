import { OrganizationInvite } from "@prisma/client";

export type GetAllOrganizationInviteResponse = (Pick<
    OrganizationInvite,
    "organizationInviteId" | "email" | "status" | "role"
> & {
    createdAt: string;
    expiredDate: string;
})[];
