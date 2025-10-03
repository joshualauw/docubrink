import { Module } from "@nestjs/common";
import { SecurityModule } from "src/core/security/security.module";
import { ApiKeyController } from "src/modules/apiKey/api-key.controller";
import { ApiKeyService } from "src/modules/apiKey/api-key.service";
import { OrganizationModule } from "src/modules/organization/organization.module";

@Module({
    imports: [SecurityModule, OrganizationModule],
    controllers: [ApiKeyController],
    providers: [ApiKeyService],
})
export class ApiKeyModule {}
