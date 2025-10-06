import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { Request } from "express";
import { PrismaService } from "nestjs-prisma";
import { OrganizationUserContextService } from "src/modules/organization/services/organization-user-context.service";
import { UserJwtPayload } from "src/types/UserJwtPayload";

@Injectable()
export class OrganizationRolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prismaService: PrismaService,
        private organizationUserContextService: OrganizationUserContextService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>("roles", [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user as UserJwtPayload;

        const organizationId = parseInt(request.params.organizationId);
        if (!organizationId) throw new BadRequestException("organization id not provided");

        const organizationUser = await this.prismaService.organizationUser.findFirstOrThrow({
            where: { userId: user.userId, organizationId },
        });

        if (requiredRoles.includes(organizationUser.role) || organizationUser.role == "OWNER") {
            this.organizationUserContextService.set({
                organizationUserId: organizationUser.organizationUserId,
                organizationId,
                userId: user.userId,
                role: organizationUser.role,
            });

            return true;
        } else {
            throw new ForbiddenException("User doesn't have permission to perform this action");
        }
    }
}
