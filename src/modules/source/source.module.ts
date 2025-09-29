import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { SecurityModule } from "src/core/security/security.module";
import { OrganizationModule } from "src/modules/organization/organization.module";
import { SourceProcessor } from "src/modules/source/processor/source.processor";
import { SourceController } from "src/modules/source/source.controller";
import { SourceService } from "src/modules/source/source.service";
import { QueueKey } from "src/types/QueueKey";

@Module({
    imports: [OrganizationModule, SecurityModule, BullModule.registerQueue({ name: QueueKey.SOURCE })],
    controllers: [SourceController],
    providers: [SourceService, SourceProcessor],
})
export class SourceModule {}
