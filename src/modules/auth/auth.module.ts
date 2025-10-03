import { Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "src/modules/auth/auth.controller";
import { AuthService } from "src/modules/auth/auth.service";
import jwtConfig from "src/config/jwt.config";
import { SecurityModule } from "src/core/security/security.module";
import { TokenService } from "src/modules/auth/services/token.service";
import { UserContextService } from "src/modules/auth/services/user-context.service";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "src/modules/auth/strategies/jwt.strategy";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.registerAsync({
            imports: [ConfigModule.forFeature(jwtConfig)],
            useFactory: (config: ConfigType<typeof jwtConfig>) => ({
                secret: config.secret,
                signOptions: {
                    expiresIn: config.expiresIn,
                },
            }),
            inject: [jwtConfig.KEY],
        }),
        SecurityModule,
    ],
    controllers: [AuthController],
    providers: [JwtStrategy, AuthService, TokenService, UserContextService],
    exports: [UserContextService],
})
export class AuthModule {}
