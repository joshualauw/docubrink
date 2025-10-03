import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthToken, GetAuthTokenDto } from "src/modules/auth/dtos/AuthToken";
import jwtConfig from "src/config/jwt.config";

@Injectable()
export class TokenService {
    constructor(
        private jwtService: JwtService,
        @Inject(jwtConfig.KEY) private jwtCfg: ConfigType<typeof jwtConfig>,
    ) {}

    generateToken(payload: GetAuthTokenDto): AuthToken {
        const accessToken = this.jwtService.sign({
            sub: payload.userId.toString(),
            userId: payload.userId,
            email: payload.email,
            username: payload.username,
        });

        return {
            accessToken,
            refreshToken: accessToken, //TODO: implement refresh token
            expiresIn: this.jwtCfg.expiresIn,
            type: "Bearer",
        };
    }
}
