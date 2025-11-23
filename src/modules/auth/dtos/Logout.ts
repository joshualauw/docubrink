import { RefreshToken } from "@prisma/client";

export type LogoutResponse = Pick<RefreshToken, "refreshTokenId"> & {
    timestamp: string;
};
