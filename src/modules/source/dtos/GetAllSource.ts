import { Organization, Source } from "@prisma/client";

export type GetAllSourceDto = Pick<Organization, "organizationId">;

export type GetAllSourceResponse = (Pick<Source, "sourceId" | "title"> & {
    totalChunks: number;
})[];
