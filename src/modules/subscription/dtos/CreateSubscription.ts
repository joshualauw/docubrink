import z from "zod";

export const createSubscriptionBody = z.object({
    planId: z.number(),
});

export type CreateSubscriptionBody = z.infer<typeof createSubscriptionBody>;

export type CreateSubscriptionDto = CreateSubscriptionBody;

export interface CreateSubscriptionResponse {
    checkoutUrl: string | null;
}
