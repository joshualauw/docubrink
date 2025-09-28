import { Request } from "express";
import { UserJwtPayload } from "src/types/UserJwtPayload";

declare module "express" {
    interface Request {
        user?: UserJwtPayload;
    }
}
