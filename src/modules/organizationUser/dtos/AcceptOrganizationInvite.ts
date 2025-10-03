import { OrganizationUser } from "@prisma/client";
import z from "zod";

export const acceptOrganizationInviteBody = z.object({
    code: z.string().min(1, "code is required"),
    status: z.enum(["ACCEPTED", "REJECTED"]),
});

export type AcceptOrganizationInviteBody = z.infer<typeof acceptOrganizationInviteBody>;

export type AcceptOrganizationInviteDto = AcceptOrganizationInviteBody;

export type AcceptOrganizationInviteResponse =
    | (Pick<OrganizationUser, "organizationUserId"> & {
          createdAt: string;
      })
    | null;
