import * as z from "zod";

export const ALLOWED_SCOPES = [
    "source.read",
    "source.write",
    "source.delete",
    "source.query",
    "billing.read",
    "billing.manage",
] as const;

export const AllowedScope = z.enum(ALLOWED_SCOPES);

export type ApiKeyScope = z.infer<typeof AllowedScope>;
