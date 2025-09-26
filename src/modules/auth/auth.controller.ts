import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { AuthService } from "src/modules/auth/auth.service";
import { Public } from "src/modules/auth/decorators/public.decorator";
import { LoginBody, loginBody, LoginResponse } from "src/modules/auth/dtos/Login";
import { RegisterBody, registerBody, RegisterResponse } from "src/modules/auth/dtos/Register";
import { ApiResponse } from "src/types/ApiResponse";
import { apiResponse } from "src/utils/api";

@Controller("/api/auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post("/register")
    @UsePipes(new ZodValidationPipe(registerBody))
    async register(@Body() body: RegisterBody): Promise<ApiResponse<RegisterResponse>> {
        const res = await this.authService.register(body);

        return apiResponse("register succesful", res);
    }

    @Public()
    @Post("/login")
    @UsePipes(new ZodValidationPipe(loginBody))
    async login(@Body() body: LoginBody): Promise<ApiResponse<LoginResponse>> {
        const res = await this.authService.login(body);

        return apiResponse("login succesful", res);
    }
}
