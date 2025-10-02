import dayjs from "dayjs";
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { StripeService } from "src/core/payment/stripe/stripe.service";
import { CreateOrganizationDto, CreateOrganizationResponse } from "src/modules/organization/dtos/CreateOrganization";
import { OrganizationUserContextService } from "src/modules/organization/services/organization-user-context.service";

@Injectable()
export class OrganizationService {
    constructor(
        private prismaService: PrismaService,
        private stripeService: StripeService,
        private organizationUserContextService: OrganizationUserContextService,
    ) {}

    async create(payload: CreateOrganizationDto): Promise<CreateOrganizationResponse> {
        const organizationUser = this.organizationUserContextService.get();

        const organizationCountByUser = await this.prismaService.organizationUser.count({
            where: {
                userId: organizationUser.userId,
                role: "ADMIN",
            },
        });

        if (organizationCountByUser == 3) throw new BadRequestException("maximum organization created");

        const basicPlan = await this.prismaService.plan.findFirstOrThrow({
            where: { name: "free" },
        });

        const startDate = dayjs();
        const endDate = startDate.add(1, "month");

        const organization = await this.prismaService.$transaction(async (tx) => {
            const organization = await tx.organization.create({
                data: {
                    name: payload.name,
                    description: payload.name,
                    email: payload.email,
                    stripeCustomerId: "",
                    organizationUser: {
                        create: {
                            userId: organizationUser.userId,
                            role: "ADMIN",
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

            const subscription = await this.stripeService.createSubscription({
                customerId: customer.id,
                priceId: basicPlan.stripePriceId,
            });

            await tx.subscription.create({
                data: {
                    organizationId: organization.organizationId,
                    planId: basicPlan.planId,
                    status: "ACTIVE",
                    startDate: startDate.toDate(),
                    endDate: endDate.toDate(),
                    stripeCustomerId: customer.id,
                    stripeSubscriptionId: subscription.id,
                },
            });

            return organization;
        });

        return { organizationId: organization.organizationId, createdAt: organization.createdAt.toISOString() };
    }
}
