import z from "zod";
import { AuthToken } from "src/modules/auth/dtos/AuthToken";

export const refreshTokenBody = z.object({
    refreshToken: z.string().min(1, "refresh token is required"),
});

export type RefreshTokenBody = z.infer<typeof refreshTokenBody>;

export type RefreshTokenDto = RefreshTokenBody;

export type RefreshTokenResponse = AuthToken;
