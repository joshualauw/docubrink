import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import { PrismaService } from "nestjs-prisma";
import { UserContextService } from "src/modules/auth/services/user-context.service";
import { OrganizationUserContextService } from "src/modules/organization/services/organization-user-context.service";
import {
    AcceptOrganizationInviteDto,
    AcceptOrganizationInviteResponse,
} from "src/modules/organizationUser/dtos/AcceptOrganizationInvite";
import {
    CreateOrganizationInviteDto,
    CreateOrganizationInviteResponse,
} from "src/modules/organizationUser/dtos/CreateOrganizationInvite";

import { genRandomAlphanum } from "src/utils/common";

@Injectable()
export class OrganizationUserService {
    constructor(
        private prismaService: PrismaService,
        private organizationUserContextService: OrganizationUserContextService,
        private userContextService: UserContextService,
    ) {}

    async invite(payload: CreateOrganizationInviteDto): Promise<CreateOrganizationInviteResponse> {
        const organizationUser = this.organizationUserContextService.get();

        const userExist = await this.prismaService.organizationUser.findFirst({
            where: { organizationId: organizationUser.organizationId, user: { email: payload.email } },
        });

        if (userExist) {
            throw new BadRequestException("Organization user with this email already exist");
        }

        const organizationInvite = await this.prismaService.organizationInvite.create({
            data: {
                organizationId: organizationUser.organizationId,
                email: payload.email,
                role: payload.role,
                status: "INVITED",
                code: genRandomAlphanum(6),
                expiredDate: dayjs().add(1, "month").toISOString(),
            },
        });

        return {
            organizationInviteId: organizationInvite.organizationInviteId,
            createdAt: organizationInvite.createdAt.toISOString(),
        };
    }

    async accept(payload: AcceptOrganizationInviteDto): Promise<AcceptOrganizationInviteResponse> {
        const user = this.userContextService.get();

        const organizationInvite = await this.prismaService.organizationInvite.findFirst({
            where: { email: user.email, code: payload.code, expiredDate: { gt: dayjs().toDate() } },
        });

        if (!organizationInvite) throw new ForbiddenException("Invitation not found");

        await this.prismaService.organizationInvite.update({
            where: { organizationInviteId: organizationInvite.organizationInviteId },
            data: {
                status: payload.status,
            },
        });

        if (payload.status == "ACCEPTED") {
            const organizationUser = await this.prismaService.organizationUser.create({
                data: {
                    organizationId: organizationInvite.organizationId,
                    userId: user.userId,
                    role: organizationInvite.role,
                },
            });

            return {
                organizationUserId: organizationUser.organizationUserId,
                createdAt: organizationUser.createdAt.toISOString(),
            };
        }

        return null;
    }
}
