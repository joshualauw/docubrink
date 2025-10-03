import { Module } from "@nestjs/common";
import { MailgunService } from "src/core/email/mailgun/mailgun.service";

@Module({
    providers: [MailgunService],
})
export class EmailModule {}
