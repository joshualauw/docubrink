import { Organization } from "@prisma/client";
import z from "zod";

export const createOrganizationBody = z.object({
    name: z.string().min(1, "name is required"),
    email: z.string().min(1, "email is required").email("email must be a valid email"),
    description: z.string(),
});

export type CreateOrganizationBody = z.infer<typeof createOrganizationBody>;

export type CreateOrganizationDto = CreateOrganizationBody;

export type CreateOrganizationResponse = Pick<Organization, "organizationId"> & {
    createdAt: string;
};
