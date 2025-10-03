import { Module } from "@nestjs/common";
import { PaymentModule } from "src/core/payment/payment.module";
import { SecurityModule } from "src/core/security/security.module";
import { AuthModule } from "src/modules/auth/auth.module";
import { OrganizationController } from "src/modules/organization/organization.controller";
import { OrganizationService } from "src/modules/organization/organization.service";
import { OrganizationContextService } from "src/modules/organization/services/organization-context.service";
import { OrganizationUserContextService } from "src/modules/organization/services/organization-user-context.service";

@Module({
    imports: [PaymentModule, SecurityModule, AuthModule],
    controllers: [OrganizationController],
    providers: [OrganizationService, OrganizationContextService, OrganizationUserContextService],
    exports: [OrganizationContextService, OrganizationUserContextService],
})
export class OrganizationModule {}
