import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { Request } from "express";
import { PrismaService } from "nestjs-prisma";
import { BcryptService } from "src/core/security/bcrypt/bcrypt.service";

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        private prismaService: PrismaService,
        private bcryptService: BcryptService,
    ) {}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const request = ctx.switchToHttp().getRequest<Request>();

        const key = request.headers["x-api-key"] as string;
        if (!key) throw new BadRequestException("API Key is not provided");

        const organizationId = parseInt(request.params.id);
        if (!organizationId) throw new BadRequestException("organization id not provided");

        const apiKeys = await this.prismaService.apiKey.findMany({
            where: { organizationId, isActive: true },
        });

        let isValid = false;
        for (const apiKey of apiKeys) {
            if (await this.bcryptService.compare(key, apiKey.keyHash)) {
                isValid = true;
                break;
            }
        }

        if (!isValid) throw new ForbiddenException("invalid API key");

        return true;
    }
}
