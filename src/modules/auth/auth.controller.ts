import { Controller } from "@nestjs/common";
import { AuthService } from "src/modules/auth/auth.service";

@Controller("/api/auth")
export class AuthController {
    constructor(private authService: AuthService) {}
}
