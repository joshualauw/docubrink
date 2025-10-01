import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { ApiKeyService } from "src/modules/apiKey/api-key.service";
import { OrganizationRoles } from "src/modules/organization/decorators/organization-role.decorator";
import { CreateApiKeyBody, createApiKeyBody } from "src/modules/apiKey/dtos/CreateApiKey";
import { updateApiKeyBody, UpdateApiKeyBody } from "src/modules/apiKey/dtos/UpdateApiKey";
import { OrganizationRolesGuard } from "src/modules/organization/guards/organization-role.guard";
import { apiResponse } from "src/utils/api";

@Controller("/api/:organizationId/api-key")
export class ApiKeyController {
    constructor(private apiKeyService: ApiKeyService) {}

    @Get()
    @OrganizationRoles("ADMIN")
    @UseGuards(OrganizationRolesGuard)
    async getAll(@Param("organizationId", ParseIntPipe) organizationId: number) {
        const res = await this.apiKeyService.getAll({ organizationId });

        return apiResponse("get all api key successful", res);
    }

    @Get(":apiKeyId")
    @OrganizationRoles("ADMIN")
    @UseGuards(OrganizationRolesGuard)
    async getDetail(@Param("apiKeyId", ParseIntPipe) apiKeyId: number) {
        const res = await this.apiKeyService.getDetail({ apiKeyId });

        return apiResponse("get detail api key successful", res);
    }

    @Post()
    @OrganizationRoles("ADMIN")
    @UseGuards(OrganizationRolesGuard)
    @UsePipes(new ZodValidationPipe(createApiKeyBody))
    async create(@Param("organizationId", ParseIntPipe) organizationId: number, @Body() body: CreateApiKeyBody) {
        const res = await this.apiKeyService.create({ ...body, organizationId });

        return apiResponse("create api key successful", res);
    }

    @Put(":apiKeyId")
    @OrganizationRoles("ADMIN")
    @UseGuards(OrganizationRolesGuard)
    @UsePipes(new ZodValidationPipe(updateApiKeyBody))
    async update(@Param("apiKeyId", ParseIntPipe) apiKeyId: number, @Body() body: UpdateApiKeyBody) {
        const res = await this.apiKeyService.update({ ...body, apiKeyId });

        return apiResponse("update api key successful", res);
    }

    @Delete(":apiKeyId")
    @OrganizationRoles("ADMIN")
    @UseGuards(OrganizationRolesGuard)
    async delete(@Param("apiKeyId", ParseIntPipe) apiKeyId: number) {
        const res = await this.apiKeyService.delete({ apiKeyId });

        return apiResponse("delete api key successful", res);
    }
}
