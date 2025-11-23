import { Injectable } from "@nestjs/common";
import { StripeService } from "src/core/payment/stripe/stripe.service";
import { PrismaService } from "nestjs-prisma";
import Stripe from "stripe";
import dayjs from "dayjs";
import { Subscription } from "@prisma/client";

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

        await this.resetFreePlan(data.id);
    }

    async subscriptionCreated(payload: Stripe.CustomerSubscriptionCreatedEvent.Data): Promise<void> {
        const data = payload.object;
        const itemData = data.items.data[0];
        const customerId = data.customer.toString();

        const organization = await this.prismaService.organization.findFirstOrThrow({
            where: { stripeCustomerId: customerId },
        });

        const freePlan = await this.prismaService.plan.findFirstOrThrow({
            where: { name: "free" },
        });

        const startDate = dayjs(itemData.current_period_start * 1000).toDate();
        const endDate = dayjs(itemData.current_period_end * 1000).toDate();

        await this.prismaService.subscription.create({
            data: {
                organizationId: organization.organizationId,
                planId: freePlan.planId,
                startDate,
                endDate,
                renewalDate: endDate,
                stripeSubscriptionId: data.id,
                stripeStatus: data.status,
            },
        });

        await this.resetOrganizationAiUsage(organization.organizationId);
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

        let subscription: Subscription;

        switch (data.status) {
            // invoice payment succeed
            case "active":
                const endDate = dayjs(itemData.current_period_end * 1000).toDate();
                subscription = await this.prismaService.subscription.update({
                    where: { stripeSubscriptionId: subscriptionId },
                    data: {
                        planId: plan.planId,
                        stripeStatus: data.status,
                        isActive: true,
                        endDate,
                        renewalDate: endDate,
                    },
                });
                await this.resetOrganizationAiUsage(subscription.organizationId);
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
                await this.resetFreePlan(data.customer.toString());
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
        await this.resetFreePlan(data.customer.toString());
    }

    private async resetFreePlan(customerId: string): Promise<void> {
        const freePlan = await this.prismaService.plan.findFirstOrThrow({
            where: { name: "free" },
        });

        await this.stripeService.createSubscription({
            customerId,
            priceId: freePlan.stripePriceId!,
        });
    }

    private async resetOrganizationAiUsage(organizationId: number): Promise<void> {
        await this.prismaService.organization.update({
            where: { organizationId },
            data: { aiEmbeddingUsage: 0, aiQueryUsage: 0 },
        });
    }
}
