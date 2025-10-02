import { Module } from "@nestjs/common";
import { SecurityModule } from "src/core/security/security.module";
import { ApiKeyController } from "src/modules/apiKey/api-key.controller";
import { ApiKeyService } from "src/modules/apiKey/api-key.service";
import { ApiKeyGuard } from "src/modules/apiKey/guards/api-key.guard";
import { OrganizationModule } from "src/modules/organization/organization.module";

@Module({
    imports: [SecurityModule, OrganizationModule],
    controllers: [ApiKeyController],
    providers: [ApiKeyService, ApiKeyGuard],
    exports: [ApiKeyGuard],
})
export class ApiKeyModule {}
