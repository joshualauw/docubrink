export interface UserJwtPayload {
    sub: string;
    userId: number;
    email: string;
    username: string;
    iat: number;
    exp: number;
}
