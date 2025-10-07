import { Body, Controller, Post, UseGuards, UsePipes } from "@nestjs/common";
import { OrganizationRoles } from "src/modules/organization/decorators/organization-role.decorator";
import { OrganizationRolesGuard } from "src/modules/organization/guards/organization-role.guard";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import {
    CreateSubscriptionBody,
    createSubscriptionBody,
    CreateSubscriptionResponse,
} from "src/modules/subscription/dtos/CreateSubscription";
import { ApiResponse } from "src/types/ApiResponse";
import { SubscriptionService } from "src/modules/subscription/subscription.service";
import { apiResponse } from "src/utils/api";

@Controller("/api/:organizationId/subscription")
export class SubscriptionController {
    constructor(private subscriptionService: SubscriptionService) {}

    @Post("new")
    @OrganizationRoles("ADMIN")
    @UseGuards(OrganizationRolesGuard)
    @UsePipes(new ZodValidationPipe(createSubscriptionBody))
    async create(@Body() body: CreateSubscriptionBody): Promise<ApiResponse<CreateSubscriptionResponse>> {
        const res = await this.subscriptionService.create(body);

        return apiResponse("create subscription successful", res);
    }
}
