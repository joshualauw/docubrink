import { Module } from "@nestjs/common";
import { PaymentModule } from "src/core/payment/payment.module";
import { SecurityModule } from "src/core/security/security.module";
import { ApiKeyGuard } from "src/modules/organization/guards/api-key.guard";
import { OrganizationController } from "src/modules/organization/organization.controller";
import { OrganizationService } from "src/modules/organization/organization.service";

@Module({
    imports: [PaymentModule, SecurityModule],
    controllers: [OrganizationController],
    providers: [OrganizationService, ApiKeyGuard],
    exports: [ApiKeyGuard],
})
export class OrganizationModule {}
