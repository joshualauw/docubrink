import { OrganizationInvite } from "@prisma/client";
import z from "zod";

export const createOrganizationInviteBody = z.object({
    email: z.string().min(1, "email is required").email(),
    role: z.enum(["ADMIN", "MEMBER"]),
});

export type CreateOrganizationInviteBody = z.infer<typeof createOrganizationInviteBody>;

export type CreateOrganizationInviteDto = CreateOrganizationInviteBody;

export type CreateOrganizationInviteResponse = Pick<OrganizationInvite, "organizationInviteId"> & {
    createdAt: string;
};
