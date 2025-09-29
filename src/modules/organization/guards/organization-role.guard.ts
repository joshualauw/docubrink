import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { Request } from "express";
import { PrismaService } from "nestjs-prisma";
import { UserJwtPayload } from "src/types/UserJwtPayload";

@Injectable()
export class OrganizationRolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prismaService: PrismaService,
    ) {}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.get<Role[]>("roles", ctx.getHandler());

        if (!requiredRoles) {
            return true;
        }

        const request = ctx.switchToHttp().getRequest<Request>();
        const user = request.user as UserJwtPayload;

        const organizationId = parseInt(request.params.id);
        if (!organizationId) throw new BadRequestException("organization id not provided");

        await this.prismaService.organization.findFirstOrThrow({
            where: { organizationId },
        });

        const roleUser = await this.prismaService.organizationUser.findFirst({
            where: { userId: user.userId, organizationId, role: { in: requiredRoles } },
        });

        if (!roleUser) {
            throw new ForbiddenException("User doesn't have permission to perform this action");
        }

        return true;
    }
}
