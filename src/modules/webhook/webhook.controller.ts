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
        }

        return apiResponse("stripe webhook handled");
    }
}
