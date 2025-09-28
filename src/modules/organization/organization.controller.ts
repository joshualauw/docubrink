import { Body, Controller, Delete, Param, ParseIntPipe, Post, Put, UseGuards, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { OrganizationRoles } from "src/modules/organization/decorators/organization-role.decorator";
import { CreateApiKeyBody, createApiKeyBody } from "src/modules/organization/dtos/CreateApiKey";
import { CreateOrganizationBody, createOrganizationBody } from "src/modules/organization/dtos/CreateOrganization";
import { UpdateApiKeyBody, updateApiKeyBody } from "src/modules/organization/dtos/UpdateApiKey";
import { OrganizationRolesGuard } from "src/modules/organization/guards/organization-role.guard";
import { OrganizationService } from "src/modules/organization/organization.service";
import { UserJwtPayload } from "src/types/UserJwtPayload";
import { apiResponse } from "src/utils/api";

@Controller("/api/organization")
export class OrganizationController {
    constructor(private organizationService: OrganizationService) {}

    @Post()
    @UsePipes(new ZodValidationPipe(createOrganizationBody))
    async create(@Body() body: CreateOrganizationBody, @CurrentUser() user: UserJwtPayload) {
        const res = await this.organizationService.create({ ...body, userId: user.userId });

        return apiResponse("create organization successful", res);
    }

    @Post("/:id/api-key")
    @UsePipes(new ZodValidationPipe(createApiKeyBody))
    @OrganizationRoles("ADMIN")
    @UseGuards(OrganizationRolesGuard)
    async createApiKey(@Param("id", ParseIntPipe) id: number, @Body() body: CreateApiKeyBody) {
        const res = await this.organizationService.createApiKey({ ...body, organizationId: id });

        return apiResponse("create api key successful", res);
    }

    @Put("/:id/api-key/:apiKeyId")
    @UsePipes(new ZodValidationPipe(updateApiKeyBody))
    @OrganizationRoles("ADMIN")
    @UseGuards(OrganizationRolesGuard)
    async updateApiKey(@Param("apiKeyId", ParseIntPipe) apiKeyId: number, @Body() body: UpdateApiKeyBody) {
        const res = await this.organizationService.updateApiKey({ ...body, apiKeyId });

        return apiResponse("update api key successful", res);
    }

    @Delete("/:id/api-key/:apiKeyId")
    @OrganizationRoles("ADMIN")
    @UseGuards(OrganizationRolesGuard)
    async deleteApiKey(@Param("apiKeyId", ParseIntPipe) apiKeyId: number) {
        const res = await this.organizationService.deleteApiKey({ apiKeyId });

        return apiResponse("delete api key successful", res);
    }
}
