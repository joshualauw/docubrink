import redisConfig from "src/config/redis.config";
import KeyvRedis from "@keyv/redis";
import { BullModule } from "@nestjs/bullmq";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import { LlmModule } from "src/core/llm/llm.module";
import { SecurityModule } from "src/core/security/security.module";
import { OrganizationModule } from "src/modules/organization/organization.module";
import { SourceProcessor } from "src/modules/source/processor/source.processor";
import { ChunkingService } from "src/modules/source/services/chunking.service";
import { RetrievalService } from "src/modules/source/services/retrieval.service";
import { SourceController } from "src/modules/source/source.controller";
import { SourceService } from "src/modules/source/source.service";
import { QueueKey } from "src/types/QueueKey";

@Module({
    imports: [
        OrganizationModule,
        SecurityModule,
        LlmModule,
        BullModule.registerQueue({ name: QueueKey.SOURCE }),
        CacheModule.registerAsync({
            imports: [ConfigModule.forFeature(redisConfig)],
            useFactory: (config: ConfigType<typeof redisConfig>) => ({
                stores: [new KeyvRedis(`redis://${config.host}:${config.port}`)],
            }),
            inject: [redisConfig.KEY],
        }),
    ],
    controllers: [SourceController],
    providers: [SourceService, SourceProcessor, ChunkingService, RetrievalService],
})
export class SourceModule {}
