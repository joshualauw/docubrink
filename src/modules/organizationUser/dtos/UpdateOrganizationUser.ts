import z from "zod";
import { OrganizationUser } from "@prisma/client";

export const updateOrganizationUserBody = z.object({
    role: z.enum(["ADMIN", "MEMBER"]),
});

export type UpdateOrganizationUserBody = z.infer<typeof updateOrganizationUserBody>;

export type UpdateOrganizationUserDto = UpdateOrganizationUserBody & Pick<OrganizationUser, "organizationUserId">

export type UpdateOrganizationUserResponse = Pick<OrganizationUser, "organizationUserId"> & {
    updatedAt: string;
};