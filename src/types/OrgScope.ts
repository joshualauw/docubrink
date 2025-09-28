import * as z from "zod";

export const ALLOWED_SCOPES = [
    "source.write",
    "source.delete",
    "billing.read",
    "billing.manage",
    "query.read",
    "query.write",
] as const;

export const AllowedScope = z.enum(ALLOWED_SCOPES);

export type OrgScope = z.infer<typeof AllowedScope>;
