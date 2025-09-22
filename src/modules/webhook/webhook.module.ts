import { Module } from "@nestjs/common";
import { PaymentModule } from "src/core/payment/payment.module";
import { WebhookController } from "src/modules/webhook/webhook.controller";

@Module({
    imports: [PaymentModule],
    controllers: [WebhookController],
})
export class WebhookModule {}
