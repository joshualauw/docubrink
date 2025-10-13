import { Injectable, Inject } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import stripeConfig from "src/config/stripe.config";
import { CreateCustomerDto } from "src/core/payment/stripe/dtos/CreateCustomer";
import Stripe from "stripe";
import commonConfig from "src/config/common.config";
import { CreateSubscriptionDto } from "src/core/payment/stripe/dtos/CreateSubscription";

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
            collection_method: "charge_automatically",
        });
    }
}
