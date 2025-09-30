import { Organization, Source } from "@prisma/client";
import z from "zod";

export const createSourceBody = z.object({
    title: z.string().min(1, "title is required"),
    type: z.enum(["UPLOAD", "URL", "MANUAL"]),
    text: z.string().min(1, "text is required"),
    metadata: z.any().optional(),
});

export type CreateSourceBody = z.infer<typeof createSourceBody>;

export type CreateSourceDto = CreateSourceBody & Pick<Organization, "organizationId">;

export type CreateSourceResponse = Pick<Source, "sourceId"> & {
    createdAt: string;
};
