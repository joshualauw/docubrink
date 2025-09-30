import { Source } from "@prisma/client";

export type DeleteSourceDto = Pick<Source, "sourceId">;

export type DeleteSourceResponse = Pick<Source, "sourceId"> & {
    timestamp: string;
};
