import { Source } from "@prisma/client";

export type GetAllSourceResponse = (Pick<Source, "sourceId" | "title"> & {
    totalChunks: number;
})[];
