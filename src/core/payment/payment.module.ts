import { Module } from "@nestjs/common";
import { StripeService } from "src/core/payment/stripe/stripe.service";

@Module({
    providers: [StripeService],
    exports: [StripeService],
})
export class PaymentModule {}
