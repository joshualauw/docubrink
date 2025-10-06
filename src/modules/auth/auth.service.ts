import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { BcryptService } from "src/core/security/bcrypt/bcrypt.service";
import { LoginDto, LoginResponse } from "src/modules/auth/dtos/Login";
import { RegisterDto, RegisterResponse } from "src/modules/auth/dtos/Register";
import { TokenService } from "src/modules/auth/services/token.service";
import { pick } from "src/utils/common";
import dayjs from "dayjs";
import { RefreshTokenDto, RefreshTokenResponse } from "src/modules/auth/dtos/RefreshToken";
import { LogoutDto, LogoutResponse } from "src/modules/auth/dtos/Logout";

@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private bcryptService: BcryptService,
        private tokenService: TokenService,
    ) {}

    async register(payload: RegisterDto): Promise<RegisterResponse> {
        const user = await this.prismaService.user.create({
            data: {
                username: payload.username,
                email: payload.email,
                password: await this.bcryptService.hash(payload.password),
            },
        });

        return { userId: user.userId, createdAt: user.createdAt.toISOString() };
    }

    async login(payload: LoginDto): Promise<LoginResponse> {
        const user = await this.prismaService.user.findFirstOrThrow({
            where: {
                email: payload.email,
            },
        });

        const comparePassword = await this.bcryptService.compare(payload.password, user.password);

        if (!comparePassword) {
            throw new UnauthorizedException("invalid credentials");
        }

        const existingToken = await this.prismaService.refreshToken.findFirst({
            where: { userId: user.userId },
        });

        if (existingToken) {
            throw new UnauthorizedException("User already logged in");
        }

        const token = this.tokenService.generateToken({
            userId: user.userId,
            username: user.username,
            email: user.email,
        });

        await this.prismaService.refreshToken.create({
            data: {
                userId: user.userId,
                token: token.refreshToken,
                expiresAt: dayjs().add(1, "month").toDate(),
            },
        });

        return { user: pick(user, "userId", "username", "email", "profileUrl"), token };
    }

    async refresh(payload: RefreshTokenDto): Promise<RefreshTokenResponse> {
        const now = dayjs();

        const refreshToken = await this.prismaService.refreshToken.findFirst({
            where: {
                token: payload.refreshToken,
                isRevoked: false,
                expiresAt: {
                    gt: now.toDate(),
                },
            },
        });

        if (!refreshToken) throw new UnauthorizedException("Invalid refresh token");

        const user = await this.prismaService.user.findFirstOrThrow({
            where: { userId: refreshToken.userId },
        });

        const token = this.tokenService.generateToken({
            userId: user.userId,
            username: user.username,
            email: user.email,
        });

        await this.prismaService.refreshToken.update({
            where: { refreshTokenId: refreshToken.refreshTokenId },
            data: { token: token.refreshToken, expiresAt: now.add(1, "month").toDate() },
        });

        return token;
    }

    async logout(payload: LogoutDto): Promise<LogoutResponse> {
        const refreshToken = await this.prismaService.refreshToken.delete({
            where: { token: payload.refreshToken },
        });

        return { refreshTokenId: refreshToken.refreshTokenId, timestamp: dayjs().toISOString() };
    }
}
