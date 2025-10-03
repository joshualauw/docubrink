import { MailerService } from "@nestjs-modules/mailer";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { InviteOrganizationUserMailDto } from "src/core/email/dtos/InviteOrganizationUserMail";
import commonConfig from "src/config/common.config";
import mailerConfig from "src/config/mailer.config";

@Injectable()
export class EmailService {
    constructor(
        private mailerService: MailerService,
        @Inject(mailerConfig.KEY) private mailerCfg: ConfigType<typeof mailerConfig>,
        @Inject(commonConfig.KEY) private commonCfg: ConfigType<typeof commonConfig>,
    ) {}

    async sendOrganizationUserInvite(payload: InviteOrganizationUserMailDto): Promise<void> {
        await this.mailerService.sendMail({
            to: payload.email,
            from: this.mailerCfg.from,
            subject: "Organization Invitation by " + payload.organizationName,
            template: "invite-organization-user",
            context: {
                senderName: payload.senderName,
                organizationName: payload.organizationName,
                organizationRole: payload.organizationRole,
                url: this.commonCfg.frontendUrl + "/login?code=" + payload.code,
            },
        });
    }
}
