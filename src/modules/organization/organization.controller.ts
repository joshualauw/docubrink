import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { CurrentUser } from "src/modules/auth/decorators/current-user.decorator";
import { CreateOrganizationBody, createOrganizationBody } from "src/modules/organization/dtos/CreateOrganization";
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
}
