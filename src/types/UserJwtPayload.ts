export interface UserJwtPayload {
    sub: string;
    id: number;
    email: string;
    username: string;
    iat: number;
    exp: number;
}
