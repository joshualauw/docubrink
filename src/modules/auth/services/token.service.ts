import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthToken, GetAuthTokenDto } from "src/modules/auth/dtos/AuthToken";
import jwtConfig from "src/config/jwt.config";
import { CryptoService } from "src/core/security/crypto/crypto.service";

@Injectable()
export class TokenService {
    constructor(
        private jwtService: JwtService,
        private cryptoService: CryptoService,
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
            refreshToken: this.cryptoService.generateKey(),
            expiresIn: this.jwtCfg.expiresIn,
            type: "Bearer",
        };
    }
}
