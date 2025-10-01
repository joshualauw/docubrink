import { Source } from "@prisma/client";

export type GetDetailSourceDto = Pick<Source, "sourceId">;

export type GetDetailSourceResponse = Pick<Source, "sourceId" | "title" | "rawText" | "type" | "metadata">;
