import { Source } from "@prisma/client";
import z from "zod";

export const uploadSourceBody = z.object({
    title: z.string().min(1, "title is required"),
    metadata: z.any().optional(),
});

export type UploadSourceBody = z.infer<typeof uploadSourceBody>;

export type UploadSourceDto = UploadSourceBody;

export type UploadSourceResponse = Pick<Source, "sourceId"> & {
    createdAt: string;
};
