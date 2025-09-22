export interface AuthToken {
    accessToken: string;
    refreshToken: string;
    type: string;
    expiresIn: number;
}

export interface GetAuthTokenDto {
    userId: number;
    email: string;
    username: string;
}
