import { Injectable, Scope } from "@nestjs/common";
import { UserJwtPayload } from "src/types/UserJwtPayload";

@Injectable({ scope: Scope.REQUEST })
export class UserContextService {
    private user: UserJwtPayload;

    set(user: UserJwtPayload) {
        this.user = user;
    }

    get(): UserJwtPayload {
        return this.user;
    }
}
