import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateSubscriptionDto, CreateSubscriptionResponse } from "src/modules/subscription/dtos/CreateSubscription";
import { PrismaService } from "nestjs-prisma";
import { OrganizationUserContextService } from "src/modules/organization/services/organization-user-context.service";
import { StripeService } from "src/core/payment/stripe/stripe.service";

@Injectable()
export class SubscriptionService {
    constructor(
        private prismaService: PrismaService,
        private organizationUserContextService: OrganizationUserContextService,
        private stripeService: StripeService,
    ) {}

    async create(payload: CreateSubscriptionDto): Promise<CreateSubscriptionResponse> {
        const organizationUser = this.organizationUserContextService.get();

        const subscription = await this.prismaService.subscription.findFirst({
            where: { organizationId: organizationUser.organizationId, planId: payload.planId, isActive: true },
        });

        if (subscription) {
            throw new BadRequestException("Subscription already exists");
        }

        const plan = await this.prismaService.plan.findFirstOrThrow({
            where: { planId: payload.planId, stripePriceId: { not: null } },
        });

        const organization = await this.prismaService.organization.findFirstOrThrow({
            where: { organizationId: organizationUser.organizationId },
        });

        const checkout = await this.stripeService.createCheckoutSession({
            priceId: plan.stripePriceId!,
            email: organization.email,
            metadata: {
                organizationId: organization.organizationId,
                planId: plan.planId,
            },
        });

        return { checkoutUrl: checkout.url };
    }
}
