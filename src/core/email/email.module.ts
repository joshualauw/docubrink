import path from "path";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import { EmailService } from "src/core/email/email.service";
import mailerConfig from "src/config/mailer.config";

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule.forFeature(mailerConfig)],
            useFactory: (config: ConfigType<typeof mailerConfig>) => ({
                transport: {
                    host: config.host,
                    port: config.port,
                    secure: false,
                    auth: {
                        user: config.user,
                        pass: config.password,
                    },
                },
                defaults: {
                    from: config.from,
                },
                template: {
                    dir: path.join(__dirname, "templates"),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [mailerConfig.KEY],
        }),
    ],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}
