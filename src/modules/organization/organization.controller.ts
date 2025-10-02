import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { CreateOrganizationBody, createOrganizationBody } from "src/modules/organization/dtos/CreateOrganization";
import { OrganizationService } from "src/modules/organization/organization.service";
import { apiResponse } from "src/utils/api";

@Controller("/api/organization")
export class OrganizationController {
    constructor(private organizationService: OrganizationService) {}

    @Post()
    @UsePipes(new ZodValidationPipe(createOrganizationBody))
    async create(@Body() body: CreateOrganizationBody) {
        const res = await this.organizationService.create({ ...body });

        return apiResponse("create organization successful", res);
    }
}
