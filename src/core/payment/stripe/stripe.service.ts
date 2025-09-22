// stripe-client.service.ts
import { Injectable, Inject } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import stripeConfig from "src/config/stripe.config";
import Stripe from "stripe";

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(@Inject(stripeConfig.KEY) private stripeCfg: ConfigType<typeof stripeConfig>) {
        this.stripe = new Stripe(this.stripeCfg.apiKey, {
            apiVersion: "2025-07-30.basil",
        });
    }

    get client(): Stripe {
        return this.stripe;
    }
}
