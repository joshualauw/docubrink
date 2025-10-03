import { Body, Controller, Post, Put, UseGuards, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { OrganizationRoles } from "src/modules/organization/decorators/organization-role.decorator";
import { OrganizationRolesGuard } from "src/modules/organization/guards/organization-role.guard";
import {
    AcceptOrganizationInviteBody,
    acceptOrganizationInviteBody,
    AcceptOrganizationInviteResponse,
} from "src/modules/organizationUser/dtos/AcceptOrganizationInvite";
import {
    CreateOrganizationInviteBody,
    createOrganizationInviteBody,
    CreateOrganizationInviteResponse,
} from "src/modules/organizationUser/dtos/CreateOrganizationInvite";
import { OrganizationUserService } from "src/modules/organizationUser/organization-user.service";
import { ApiResponse } from "src/types/ApiResponse";
import { apiResponse } from "src/utils/api";

@Controller("/api/:organizationId/organization-user")
export class OrganizationUserController {
    constructor(private organizationUserService: OrganizationUserService) {}

    @Post("invite")
    @OrganizationRoles("ADMIN")
    @UseGuards(OrganizationRolesGuard)
    @UsePipes(new ZodValidationPipe(createOrganizationInviteBody))
    async invite(@Body() body: CreateOrganizationInviteBody): Promise<ApiResponse<CreateOrganizationInviteResponse>> {
        const res = await this.organizationUserService.invite(body);

        return apiResponse("invite organization user successful", res);
    }

    @Post("accept")
    @UsePipes(new ZodValidationPipe(acceptOrganizationInviteBody))
    async accept(@Body() body: AcceptOrganizationInviteBody): Promise<ApiResponse<AcceptOrganizationInviteResponse>> {
        const res = await this.organizationUserService.accept(body);

        return apiResponse("accept organization user successful", res);
    }
}
