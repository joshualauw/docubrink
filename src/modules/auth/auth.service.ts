import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { BcryptService } from "src/core/security/bcrypt/bcrypt.service";
import { LoginDto, LoginResponse } from "src/modules/auth/dtos/Login";
import { RegisterDto, RegisterResponse } from "src/modules/auth/dtos/Register";
import { TokenService } from "src/modules/auth/services/token.service";
import { pick } from "src/utils/common";

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
        const user = await this.prismaService.user.findFirst({
            where: {
                email: payload.email,
            },
        });

        if (!user) throw new NotFoundException("user not found");

        if (!(await this.bcryptService.compare(payload.password, user.password))) {
            throw new UnauthorizedException("invalid credentials");
        }

        const token = this.tokenService.generateToken({
            userId: user.userId,
            username: user.username,
            email: user.email,
        });

        return { user: pick(user, "userId", "username", "email", "profileUrl"), token };
    }
}
