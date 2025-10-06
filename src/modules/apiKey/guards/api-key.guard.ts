import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { PrismaService } from "nestjs-prisma";
import { CryptoService } from "src/core/security/crypto/crypto.service";
import { OrganizationContextService } from "src/modules/organization/services/organization-context.service";
import { ApiKeyScope } from "src/types/ApiKeyScope";

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prismaService: PrismaService,
        private cryptoService: CryptoService,
        private organizationContextService: OrganizationContextService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredScopes = this.reflector.getAllAndOverride<ApiKeyScope[]>("scopes", [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredScopes) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();

        const key = request.headers["x-api-key"] as string;
        if (!key) throw new BadRequestException("API Key is not provided");

        const apiKey = await this.prismaService.apiKey.findFirstOrThrow({
            where: { isActive: true, keyHash: this.cryptoService.hash(key) },
        });

        if (requiredScopes.some((scope) => apiKey.scopes.includes(scope))) {
            this.organizationContextService.set(apiKey.organizationId);
            return true;
        } else {
            throw new ForbiddenException("API Key doesn't have permission to perform this action");
        }
    }
}
