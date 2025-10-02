import { Module } from "@nestjs/common";
import { PaymentModule } from "src/core/payment/payment.module";
import { SecurityModule } from "src/core/security/security.module";
import { OrganizationController } from "src/modules/organization/organization.controller";
import { OrganizationService } from "src/modules/organization/organization.service";
import { OrganizationContext } from "src/modules/organization/services/organization-context.service";

@Module({
    imports: [PaymentModule, SecurityModule],
    controllers: [OrganizationController],
    providers: [OrganizationService, OrganizationContext],
    exports: [OrganizationContext],
})
export class OrganizationModule {}
