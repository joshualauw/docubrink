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

        if (!data.metadata || !data.metadata.organizationId) return;

        const organizationId = parseInt(data.metadata.organizationId);

        await this.prismaService.organization.update({
            where: { organizationId },
            data: { stripeCustomerId: data.id },
        });
    }

    async checkoutSessionCompleted(payload: Stripe.CheckoutSessionCompletedEvent.Data): Promise<void> {
        const data = payload.object;

        if (data.mode !== "subscription" || !data.subscription || !data.customer) return;
        if (!data.metadata || !data.metadata.organizationId || !data.metadata.planId) return;

        const organizationId = parseInt(data.metadata.organizationId);
        const planId = parseInt(data.metadata.planId);
        const stripeSubscriptionId = data.subscription.toString();

        const stripeSubscription = await this.stripeService.retrieveSubscription({
            subscriptionId: stripeSubscriptionId,
        });
        const itemData = stripeSubscription.items.data[0];

        const startDate = dayjs(itemData.current_period_start * 1000).toDate();
        const endDate = dayjs(itemData.current_period_end * 1000).toDate();

        await this.prismaService.subscription.create({
            data: {
                organizationId: organizationId,
                planId: planId,
                startDate,
                endDate,
                renewalDate: endDate,
                stripeStatus: stripeSubscription.status,
                stripeSubscriptionId: stripeSubscriptionId,
            },
        });
    }

    async subscriptionUpdated(payload: Stripe.CustomerSubscriptionUpdatedEvent.Data): Promise<void> {
        const data = payload.object;
        const itemData = data.items.data[0];
        const subscriptionId = data.id;

        // cancel (will still be active until period ends)
        if (data.canceled_at) {
            await this.prismaService.subscription.update({
                where: { stripeSubscriptionId: subscriptionId },
                data: { canceledDate: dayjs(data.canceled_at * 1000).toDate(), isActive: true },
            });
            return;
        }

        // cancel the cancellation
        if (payload.previous_attributes?.canceled_at) {
            await this.prismaService.subscription.update({
                where: { stripeSubscriptionId: subscriptionId },
                data: { canceledDate: null, isActive: true },
            });
            return;
        }

        // downgrade request (will be scheduled for next period)
        if (data.schedule) return;

        // upgrade / downgrade / renewal
        const priceId = itemData.price.id.toString();
        const plan = await this.prismaService.plan.findFirstOrThrow({
            where: { stripePriceId: priceId },
        });

        switch (data.status) {
            // invoice payment succeed
            case "active":
                const endDate = dayjs(itemData.current_period_end * 1000).toDate();
                await this.prismaService.subscription.update({
                    where: { stripeSubscriptionId: subscriptionId },
                    data: {
                        planId: plan.planId,
                        stripeStatus: data.status,
                        isActive: true,
                        endDate,
                        renewalDate: endDate,
                    },
                });
                break;
            // invoice payment failed (grace period)
            case "incomplete":
            case "past_due":
                await this.prismaService.subscription.update({
                    where: { stripeSubscriptionId: subscriptionId },
                    data: { stripeStatus: data.status, isActive: true },
                });
                break;
            // invoice retry attempts exhausted
            case "incomplete_expired":
            case "unpaid":
                await this.prismaService.subscription.update({
                    where: { stripeSubscriptionId: subscriptionId },
                    data: { stripeStatus: data.status, isActive: false },
                });
                break;
        }
    }

    async subscriptionDeleted(payload: Stripe.CustomerSubscriptionDeletedEvent.Data): Promise<void> {
        const data = payload.object;
        const itemData = data.items.data[0];
        const subscriptionId = itemData.subscription.toString();

        await this.prismaService.subscription.update({
            where: { stripeSubscriptionId: subscriptionId },
            data: { stripeStatus: data.status, isActive: false },
        });
    }
}
