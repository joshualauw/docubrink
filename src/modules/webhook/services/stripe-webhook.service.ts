import { Injectable } from "@nestjs/common";
import { StripeService } from "src/core/payment/stripe/stripe.service";
import { PrismaService } from "nestjs-prisma";
import Stripe from "stripe";
import dayjs from "dayjs";

@Injectable()
export class StripeWebhookService {
    constructor(
        private prismaService: PrismaService,
        private stripeService: StripeService,
    ) {}

    async customerCreated(payload: Stripe.Customer): Promise<void> {
        const organizationId = parseInt(payload.metadata.organizationId, 0);

        await this.prismaService.organization.update({
            where: { organizationId },
            data: { stripeCustomerId: payload.id },
        });
    }

    async checkoutSessionCompleted(payload: Stripe.Checkout.Session): Promise<void> {
        if (payload.mode !== "subscription" || !payload.subscription || !payload.metadata || !payload.customer) {
            return;
        }

        const organizationId = parseInt(payload.metadata.organizationId, 0);
        const planId = parseInt(payload.metadata.planId, 0);
        const stripeSubscriptionId = payload.subscription.toString();

        const stripeSubscription = await this.stripeService.retrieveSubscription({
            subscriptionId: stripeSubscriptionId,
        });

        const startDate = dayjs();
        const endDate = startDate.add(1, "month");

        await this.prismaService.$transaction(async (tx) => {
            await tx.subscription.deleteMany({
                where: { isActive: true, organizationId },
            });

            await tx.subscription.create({
                data: {
                    organizationId: organizationId,
                    planId: planId,
                    startDate: startDate.toDate(),
                    endDate: endDate.toDate(),
                    renewalDate: endDate.toDate(),
                    stripeStatus: stripeSubscription.status,
                    stripeSubscriptionId: stripeSubscriptionId,
                },
            });
        });
    }
}
