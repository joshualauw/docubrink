import { Module } from "@nestjs/common";
import { PaymentModule } from "src/core/payment/payment.module";
import { StripeWebhookService } from "src/modules/webhook/services/stripe-webhook.service";
import { WebhookController } from "src/modules/webhook/webhook.controller";

@Module({
    imports: [PaymentModule],
    providers: [StripeWebhookService],
    controllers: [WebhookController],
})
export class WebhookModule {}
