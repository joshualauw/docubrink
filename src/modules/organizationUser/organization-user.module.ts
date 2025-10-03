import { Module } from "@nestjs/common";
import { AuthModule } from "src/modules/auth/auth.module";
import { OrganizationModule } from "src/modules/organization/organization.module";
import { OrganizationUserController } from "src/modules/organizationUser/organization-user.controller";
import { OrganizationUserService } from "src/modules/organizationUser/organization-user.service";

@Module({
    imports: [AuthModule, OrganizationModule],
    controllers: [OrganizationUserController],
    providers: [OrganizationUserService],
})
export class OrganizationUserModule {}
