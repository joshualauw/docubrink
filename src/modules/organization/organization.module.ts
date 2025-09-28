import { Module } from "@nestjs/common";
import { PaymentModule } from "src/core/payment/payment.module";
import { OrganizationController } from "src/modules/organization/organization.controller";
import { OrganizationService } from "src/modules/organization/organization.service";

@Module({
    imports: [PaymentModule],
    controllers: [OrganizationController],
    providers: [OrganizationService],
})
export class OrganizationModule {}
