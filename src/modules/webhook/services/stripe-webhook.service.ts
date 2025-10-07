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

    async handleCheckoutSessionCompleted(payload: Stripe.Checkout.Session) {
        if (payload.mode !== "subscription" || !payload.subscription || !payload.metadata || !payload.customer) {
            return;
        }

        const organizationId = parseInt(payload.metadata.organizationId, 0);
        const planId = parseInt(payload.metadata.planId, 0);
        const stripeCustomerId = payload.customer.toString();
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
                    stripeCustomerId: stripeCustomerId,
                    stripeSubscriptionId: stripeSubscriptionId,
                },
            });
        });
    }
}
