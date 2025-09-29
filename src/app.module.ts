import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "nestjs-prisma";

import { AuthModule } from "src/modules/auth/auth.module";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt.guard";
import { OrganizationModule } from "src/modules/organization/organization.module";
import { SourceModule } from "src/modules/source/source.module";
import { WebhookModule } from "src/modules/webhook/webhook.module";

import commonConfig from "src/config/common.config";
import cryptoConfig from "src/config/crypto.config";
import jwtConfig from "src/config/jwt.config";
import openaiConfig from "src/config/openai.config";
import redisConfig from "src/config/redis.config";
import stripeConfig from "src/config/stripe.config";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [commonConfig, stripeConfig, jwtConfig, redisConfig, openaiConfig, cryptoConfig],
        }),
        PrismaModule.forRoot({
            isGlobal: true,
            prismaServiceOptions: {},
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule.forFeature(redisConfig)],
            useFactory: (config: ConfigType<typeof redisConfig>) => ({
                connection: {
                    host: config.host,
                    port: config.port,
                },
            }),
            inject: [redisConfig.KEY],
        }),
        AuthModule,
        OrganizationModule,
        SourceModule,
        WebhookModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
