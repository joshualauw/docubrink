import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { Public } from "src/modules/auth/decorators/public.decorator";
import { StripeWebhookGuard } from "src/modules/webhook/guards/stripe.guard";
import { StripeWebhookService } from "src/modules/webhook/services/stripe-webhook.service";
import { apiResponse } from "src/utils/api";
import Stripe from "stripe";

@Controller("/api/webhook")
export class WebhookController {
    constructor(private stripeWebhookService: StripeWebhookService) {}

    @Public()
    @Post("stripe")
    @UseGuards(StripeWebhookGuard)
    async handleStripeWebhook(@Body() body: Stripe.Event) {
        switch (body.type) {
            case "customer.created":
                await this.stripeWebhookService.customerCreated(body.data);
                break;
            case "customer.subscription.created":
                await this.stripeWebhookService.subscriptionCreated(body.data);
                break;
            case "customer.subscription.updated":
                await this.stripeWebhookService.subscriptionUpdated(body.data);
                break;
            case "customer.subscription.deleted":
                await this.stripeWebhookService.subscriptionDeleted(body.data);
                break;
        }

        return apiResponse("stripe webhook handled");
    }
}
