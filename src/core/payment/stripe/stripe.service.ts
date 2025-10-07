import { Injectable, Inject } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import stripeConfig from "src/config/stripe.config";
import { CreateCustomerDto } from "src/core/payment/stripe/dtos/CreateCustomer";
import { CreateSubscriptionDto } from "src/core/payment/stripe/dtos/CreateSubscription";
import Stripe from "stripe";
import commonConfig from "src/config/common.config";
import { CreateCheckoutDto } from "src/core/payment/stripe/dtos/CreateCheckout";
import { RetrieveSubscriptionDto } from "src/core/payment/stripe/dtos/RetrieveSubscription";

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(
        @Inject(stripeConfig.KEY) private stripeCfg: ConfigType<typeof stripeConfig>,
        @Inject(commonConfig.KEY) private commonCfg: ConfigType<typeof commonConfig>,
    ) {
        this.stripe = new Stripe(this.stripeCfg.apiKey, {
            apiVersion: "2025-08-27.basil",
        });
    }

    get client(): Stripe {
        return this.stripe;
    }

    async createCheckoutSession(payload: CreateCheckoutDto): Promise<Stripe.Checkout.Session> {
        return this.stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [
                {
                    price: payload.priceId,
                    quantity: 1,
                },
            ],
            success_url: `${this.commonCfg.frontendUrl}?payment_status=paid`,
            cancel_url: `${this.commonCfg.frontendUrl}?payment_status=cancel`,
            customer_email: payload.email,
            metadata: payload.metadata as any,
        });
    }

    async createCustomer(payload: CreateCustomerDto): Promise<Stripe.Customer> {
        return this.stripe.customers.create({
            name: payload.organizationName,
            email: payload.organizationEmail,
            metadata: {
                organizationId: payload.organizationId.toString(),
            },
        });
    }

    async createSubscription(payload: CreateSubscriptionDto): Promise<Stripe.Subscription> {
        return this.stripe.subscriptions.create({
            customer: payload.customerId,
            items: [{ price: payload.priceId }],
            payment_behavior: "default_incomplete",
            expand: ["latest_invoice.payment_intent"],
        });
    }

    async retrieveSubscription(payload: RetrieveSubscriptionDto): Promise<Stripe.Subscription> {
        return this.stripe.subscriptions.retrieve(payload.subscriptionId);
    }
}
