import z from "zod";
import { RefreshToken } from "@prisma/client";

export const logoutBody = z.object({
    refreshToken: z.string().min(1, "refresh token is required"),
});

export type LogoutBody = z.infer<typeof logoutBody>;

export type LogoutDto = LogoutBody;

export type LogoutResponse = Pick<RefreshToken, "refreshTokenId"> & {
    timestamp: string;
};
