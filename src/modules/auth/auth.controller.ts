import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { AuthService } from "src/modules/auth/auth.service";
import { Public } from "src/modules/auth/decorators/public.decorator";
import { LoginBody, loginBody, LoginResponse } from "src/modules/auth/dtos/Login";
import { RegisterBody, registerBody, RegisterResponse } from "src/modules/auth/dtos/Register";
import { ApiResponse } from "src/types/ApiResponse";
import { apiResponse } from "src/utils/api";
import { RefreshTokenBody, refreshTokenBody, RefreshTokenResponse } from "src/modules/auth/dtos/RefreshToken";
import { LogoutBody, logoutBody, LogoutResponse } from "src/modules/auth/dtos/Logout";

@Controller("/api/auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post("register")
    @UsePipes(new ZodValidationPipe(registerBody))
    async register(@Body() body: RegisterBody): Promise<ApiResponse<RegisterResponse>> {
        const res = await this.authService.register(body);

        return apiResponse("register successful", res);
    }

    @Public()
    @Post("login")
    @UsePipes(new ZodValidationPipe(loginBody))
    async login(@Body() body: LoginBody): Promise<ApiResponse<LoginResponse>> {
        const res = await this.authService.login(body);

        return apiResponse("login successful", res);
    }

    @Public()
    @Post("refresh")
    @UsePipes(new ZodValidationPipe(refreshTokenBody))
    async refresh(@Body() body: RefreshTokenBody): Promise<ApiResponse<RefreshTokenResponse>> {
        const res = await this.authService.refresh(body);

        return apiResponse("refresh token successful", res);
    }

    @Public()
    @Post("logout")
    @UsePipes(new ZodValidationPipe(logoutBody))
    async logout(@Body() body: LogoutBody): Promise<ApiResponse<LogoutResponse>> {
        const res = await this.authService.logout(body);

        return apiResponse("logout successful", res);
    }
}
