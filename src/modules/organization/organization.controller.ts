import { Body, Controller, Get, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import {
    CreateOrganizationBody,
    createOrganizationBody,
    CreateOrganizationResponse,
} from "src/modules/organization/dtos/CreateOrganization";
import { GetAllOrganizationResponse } from "src/modules/organization/dtos/GetAllOrganization";
import { OrganizationService } from "src/modules/organization/organization.service";
import { ApiResponse } from "src/types/ApiResponse";
import { apiResponse } from "src/utils/api";

@Controller("/api/organization")
export class OrganizationController {
    constructor(private organizationService: OrganizationService) {}

    @Get()
    async getAll(): Promise<ApiResponse<GetAllOrganizationResponse>> {
        const res = await this.organizationService.getAll();

        return apiResponse("get all organization successful", res);
    }

    @Post()
    @UsePipes(new ZodValidationPipe(createOrganizationBody))
    async create(@Body() body: CreateOrganizationBody): Promise<ApiResponse<CreateOrganizationResponse>> {
        const res = await this.organizationService.create(body);

        return apiResponse("create organization successful", res);
    }
}
