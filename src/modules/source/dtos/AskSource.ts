import { Organization } from "@prisma/client";
import z from "zod";

export const askSourceBody = z.object({
    query: z.string().min(1, "query is required"),
});

export type AskSourceBody = z.infer<typeof askSourceBody>;

export type AskSourceDto = AskSourceBody & Pick<Organization, "organizationId">;

export interface AskSourceResponse {
    answer: string;
    timestamp: string;
}
