import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { PrismaService } from "nestjs-prisma";
import { CryptoService } from "src/core/security/crypto/crypto.service";
import { OrganizationContext } from "src/modules/organization/services/organization-context.service";
import { ApiKeyScope } from "src/types/ApiKeyScope";

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prismaService: PrismaService,
        private cryptoService: CryptoService,
        private organizationContext: OrganizationContext,
    ) {}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const requiredScopes = this.reflector.get<ApiKeyScope[]>("scopes", ctx.getHandler());

        if (!requiredScopes) {
            return true;
        }

        const request = ctx.switchToHttp().getRequest<Request>();

        const key = request.headers["x-api-key"] as string;
        if (!key) throw new BadRequestException("API Key is not provided");

        const apiKey = await this.prismaService.apiKey.findFirst({
            where: {
                isActive: true,
                keyHash: this.cryptoService.hash(key),
                scopes: { hasSome: requiredScopes },
            },
        });

        if (!apiKey) throw new ForbiddenException("Invalid API Key");

        this.organizationContext.set(apiKey.organizationId);

        return true;
    }
}
