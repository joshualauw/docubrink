import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import { PrismaService } from "nestjs-prisma";
import { EmailService } from "src/core/email/email.service";
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
        private emailService: EmailService,
    ) {}

    async invite(payload: CreateOrganizationInviteDto): Promise<CreateOrganizationInviteResponse> {
        const user = this.userContextService.get();
        const organizationUser = this.organizationUserContextService.get();
        const currentDate = dayjs();

        const userExist = await this.prismaService.organizationUser.findFirst({
            where: { organizationId: organizationUser.organizationId, user: { email: payload.email } },
        });

        if (userExist) {
            throw new BadRequestException("Organization user with this email already exist");
        }

        const invitationExist = await this.prismaService.organizationInvite.findFirst({
            where: {
                email: payload.email,
                organizationId: organizationUser.organizationId,
                status: "INVITED",
                expiredDate: {
                    gt: currentDate.toDate(),
                },
            },
        });

        if (invitationExist) {
            throw new BadRequestException("Invitation to this user still pending");
        }

        const organization = await this.prismaService.organization.findFirstOrThrow({
            where: { organizationId: organizationUser.organizationId },
        });

        const invitationCode = genRandomAlphanum(6);

        await this.emailService.sendOrganizationUserInvite({
            senderName: user.username,
            email: payload.email,
            organizationName: organization.name,
            organizationRole: payload.role,
            code: invitationCode,
        });

        const organizationInvite = await this.prismaService.organizationInvite.create({
            data: {
                organizationId: organizationUser.organizationId,
                email: payload.email,
                role: payload.role,
                status: "INVITED",
                code: invitationCode,
                expiredDate: currentDate.add(1, "month").toISOString(),
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
