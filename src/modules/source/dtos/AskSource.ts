import z from "zod";

export const askSourceBody = z.object({
    query: z.string().min(1, "query is required"),
    metadata: z.any().optional(),
});

export type AskSourceBody = z.infer<typeof askSourceBody>;

export type AskSourceDto = AskSourceBody;

export interface AskSourceResponse {
    answer: string;
    timestamp: string;
}
