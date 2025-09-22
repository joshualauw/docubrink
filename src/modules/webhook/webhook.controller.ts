import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { Public } from "src/modules/auth/decorators/public.decorator";
import { StripeWebhookGuard } from "src/modules/webhook/guards/stripe.guard";
import { apiResponse } from "src/utils/api";
import Stripe from "stripe";

@Controller("/api/webhook")
export class WebhookController {
    @Post("stripe")
    @Public()
    @UseGuards(StripeWebhookGuard)
    async handleStripeWebhook(@Body() body: Stripe.Event) {
        return apiResponse("stripe webhook handled");
    }
}
