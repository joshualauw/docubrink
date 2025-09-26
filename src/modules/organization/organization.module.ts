import { Module } from "@nestjs/common";
import { OrganizationController } from "src/modules/organization/organization.controller";
import { OrganizationService } from "src/modules/organization/organization.service";

@Module({
    controllers: [OrganizationController],
    providers: [OrganizationService],
})
export class OrganizationModule {}
