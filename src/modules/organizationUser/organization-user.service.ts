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
import { UpdateOrganizationUserDto, UpdateOrganizationUserResponse } from "./dtos/UpdateOrganizationUser";
import {
    RemoveOrganizationUserDto,
    RemoveOrganizationUserResponse,
} from "src/modules/organizationUser/dtos/RemoveOrganizationUser";
import { GetAllOrganizationUserResponse } from "src/modules/organizationUser/dtos/GetAllOrganizationUser";
import { GetAllOrganizationInviteResponse } from "src/modules/organizationUser/dtos/GetAllOrganizationInvite";

@Injectable()
export class OrganizationUserService {
    constructor(
        private prismaService: PrismaService,
        private organizationUserContextService: OrganizationUserContextService,
        private userContextService: UserContextService,
        private emailService: EmailService,
    ) {}

    async getAll(): Promise<GetAllOrganizationUserResponse> {
        const organizationUser = this.organizationUserContextService.get();

        const organizationUsers = await this.prismaService.organizationUser.findMany({
            where: { organizationId: organizationUser.organizationId },
            select: {
                organizationUserId: true,
                role: true,
                createdAt: true,
                user: { select: { username: true, email: true } },
            },
        });

        return organizationUsers.map((o) => ({
            organizationUserId: o.organizationUserId,
            role: o.role,
            username: o.user.username,
            email: o.user.email,
            joinedAt: o.createdAt.toISOString(),
        }));
    }

    async getAllInvited(): Promise<GetAllOrganizationInviteResponse> {
        const organizationUser = this.organizationUserContextService.get();

        const invitations = await this.prismaService.organizationInvite.findMany({
            where: { organizationId: organizationUser.organizationId },
            select: {
                organizationInviteId: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                expiredDate: true,
            },
        });

        return invitations.map((i) => ({
            organizationInviteId: i.organizationInviteId,
            email: i.email,
            role: i.role,
            status: i.status,
            createdAt: i.createdAt.toISOString(),
            expiredDate: i.expiredDate.toISOString(),
        }));
    }

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

    async update(payload: UpdateOrganizationUserDto): Promise<UpdateOrganizationUserResponse> {
        const organizationUser = this.organizationUserContextService.get();

        let targetOrganizationUser = await this.prismaService.organizationUser.findFirstOrThrow({
            where: { organizationUserId: payload.organizationUserId, organizationId: organizationUser.organizationId },
        });

        if (targetOrganizationUser.organizationUserId == organizationUser.organizationUserId) {
            throw new ForbiddenException("Cannot change self role");
        }

        if (targetOrganizationUser.role == "ADMIN" && organizationUser.role != "OWNER") {
            throw new ForbiddenException("Cannot change other admin role");
        }

        targetOrganizationUser = await this.prismaService.organizationUser.update({
            where: { organizationUserId: payload.organizationUserId, organizationId: organizationUser.organizationId },
            data: { role: payload.role },
        });

        return {
            organizationUserId: targetOrganizationUser.organizationUserId,
            updatedAt: targetOrganizationUser.updatedAt.toISOString(),
        };
    }

    async remove(payload: RemoveOrganizationUserDto): Promise<RemoveOrganizationUserResponse> {
        const organizationUser = this.organizationUserContextService.get();

        let targetOrganizationUser = await this.prismaService.organizationUser.findFirstOrThrow({
            where: { organizationUserId: payload.organizationUserId, organizationId: organizationUser.organizationId },
        });

        if (targetOrganizationUser.organizationUserId == organizationUser.organizationUserId) {
            throw new ForbiddenException("Cannot remove self");
        }

        if (targetOrganizationUser.role != "MEMBER" && organizationUser.role != "OWNER") {
            throw new ForbiddenException("Can only remove member role");
        }

        targetOrganizationUser = await this.prismaService.organizationUser.delete({
            where: { organizationUserId: payload.organizationUserId, organizationId: organizationUser.organizationId },
        });

        return { organizationUserId: targetOrganizationUser.organizationUserId, timestamp: dayjs().toISOString() };
    }
}
