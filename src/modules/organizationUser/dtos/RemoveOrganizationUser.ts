import { OrganizationUser } from "@prisma/client";

export type RemoveOrganizationUserDto = Pick<OrganizationUser, "organizationUserId">;

export type RemoveOrganizationUserResponse = Pick<OrganizationUser, "organizationUserId"> & {
    timestamp: string;
};
