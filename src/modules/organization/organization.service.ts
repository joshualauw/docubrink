import dayjs from "dayjs";
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { StripeService } from "src/core/payment/stripe/stripe.service";
import { CreateOrganizationDto, CreateOrganizationResponse } from "src/modules/organization/dtos/CreateOrganization";
import { GetAllOrganizationResponse } from "src/modules/organization/dtos/GetAllOrganization";
import { UserContextService } from "src/modules/auth/services/user-context.service";

@Injectable()
export class OrganizationService {
    constructor(
        private prismaService: PrismaService,
        private stripeService: StripeService,
        private userContextService: UserContextService,
    ) {}

    async getAll(): Promise<GetAllOrganizationResponse> {
        const user = this.userContextService.get();

        const organizations = await this.prismaService.organizationUser.findMany({
            where: { userId: user.userId },
            include: { organization: true },
        });

        return organizations.map((o) => ({
            organizationId: o.organizationId,
            name: o.organization.name,
            role: o.role,
        }));
    }

    async create(payload: CreateOrganizationDto): Promise<CreateOrganizationResponse> {
        const user = this.userContextService.get();

        const organizationCountByUser = await this.prismaService.organizationUser.count({
            where: {
                userId: user.userId,
                role: "OWNER",
            },
        });

        if (organizationCountByUser == 3) throw new BadRequestException("maximum organization created");

        const basicPlan = await this.prismaService.plan.findFirstOrThrow({
            where: { name: "free" },
        });

        const organization = await this.prismaService.$transaction(async (tx) => {
            const organization = await tx.organization.create({
                data: {
                    name: payload.name,
                    description: payload.name,
                    email: payload.email,
                    stripeCustomerId: "",
                    organizationUser: {
                        create: {
                            userId: user.userId,
                            role: "OWNER",
                        },
                    },
                },
            });

            const customer = await this.stripeService.createCustomer({
                organizationId: organization.organizationId,
                organizationName: organization.name,
                organizationEmail: payload.email,
            });

            await tx.organization.update({
                where: { organizationId: organization.organizationId },
                data: { stripeCustomerId: customer.id },
            });

            await tx.subscription.create({
                data: {
                    organizationId: organization.organizationId,
                    planId: basicPlan.planId,
                    isActive: true,
                    startDate: dayjs().toDate(),
                    stripeStatus: "active",
                    stripeCustomerId: customer.id,
                },
            });

            return organization;
        });

        return { organizationId: organization.organizationId, createdAt: organization.createdAt.toISOString() };
    }
}
