import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { LlmModule } from "src/core/llm/llm.module";
import { SecurityModule } from "src/core/security/security.module";
import { OrganizationModule } from "src/modules/organization/organization.module";
import { SourceProcessor } from "src/modules/source/processor/source.processor";
import { ChunkingService } from "src/modules/source/services/chunking.service";
import { SourceController } from "src/modules/source/source.controller";
import { SourceService } from "src/modules/source/source.service";
import { QueueKey } from "src/types/QueueKey";

@Module({
    imports: [OrganizationModule, SecurityModule, LlmModule, BullModule.registerQueue({ name: QueueKey.SOURCE })],
    controllers: [SourceController],
    providers: [SourceService, SourceProcessor, ChunkingService],
})
export class SourceModule {}
