import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigType } from "@nestjs/config";
import jwtConfig from "src/config/jwt.config";
import { UserJwtPayload } from "src/types/UserJwtPayload";
import { UserContextService } from "src/modules/auth/services/user-context.service";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(
        @Inject(jwtConfig.KEY) config: ConfigType<typeof jwtConfig>,
        private moduleRef: ModuleRef,
    ) {
        super({
            passReqToCallback: true,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.secret,
        });
    }

    async validate(request: Request, payload: UserJwtPayload) {
        const contextId = ContextIdFactory.getByRequest(request);
        const userContextService = await this.moduleRef.resolve(UserContextService, contextId);
        userContextService.set(payload);

        return payload;
    }
}
