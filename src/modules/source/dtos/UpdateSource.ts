import { Source } from "@prisma/client";
import z from "zod";

export const updateSourceBody = z.object({
    title: z.string().min(1, "title is required"),
});

export type UpdateSourceBody = z.infer<typeof updateSourceBody>;

export type UpdateSourceDto = UpdateSourceBody & Pick<Source, "sourceId">;

export type UpdateSourceResponse = Pick<Source, "sourceId"> & {
    updatedAt: string;
};
