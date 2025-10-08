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

    async customerCreated(payload: Stripe.CustomerCreatedEvent.Data): Promise<void> {
        const data = payload.object;
        const organizationId = parseInt(data.metadata.organizationId, 0);

        await this.prismaService.organization.update({
            where: { organizationId },
            data: { stripeCustomerId: data.id },
        });
    }

    async checkoutSessionCompleted(payload: Stripe.CheckoutSessionCompletedEvent.Data): Promise<void> {
        const data = payload.object;

        if (data.mode !== "subscription" || !data.subscription || !data.metadata || !data.customer) {
            return;
        }

        const organizationId = parseInt(data.metadata.organizationId, 0);
        const planId = parseInt(data.metadata.planId, 0);
        const stripeSubscriptionId = data.subscription.toString();

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

    async subscriptionUpdated(payload: Stripe.CustomerSubscriptionUpdatedEvent.Data): Promise<void> {
        const data = payload.object;
        const previousData = payload.previous_attributes;

        if (!previousData || !previousData.items) {
            return;
        }

        const priceId = data.items.data[0].price.id.toString();
        const previousSubscriptionId = previousData.items.data[0].subscription.toString();

        const plan = await this.prismaService.plan.findFirstOrThrow({
            where: { stripePriceId: priceId },
        });

        await this.prismaService.subscription.updateMany({
            where: { stripeSubscriptionId: previousSubscriptionId },
            data: {
                planId: plan.planId,
                stripeStatus: data.status,
                endDate: dayjs().add(1, "month").toDate(),
            },
        });
    }
}
