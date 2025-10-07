import { Module } from "@nestjs/common";
import { SubscriptionService } from "src/modules/subscription/subscription.service";
import { SubscriptionController } from "src/modules/subscription/subscription.controller";
import { PaymentModule } from "src/core/payment/payment.module";
import { OrganizationModule } from "src/modules/organization/organization.module";

@Module({
    imports: [PaymentModule, OrganizationModule],
    controllers: [SubscriptionController],
    providers: [SubscriptionService],
})
export class SubscriptionModule {}
