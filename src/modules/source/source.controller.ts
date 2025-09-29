import { Body, Controller, Param, ParseIntPipe, Post, UseGuards, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { Public } from "src/modules/auth/decorators/public.decorator";
import { ApiKeyGuard } from "src/modules/organization/guards/api-key.guard";
import { CreateSourceBody, createSourceBody, CreateSourceResponse } from "src/modules/source/dtos/CreateSource";
import { SourceService } from "src/modules/source/source.service";
import { ApiResponse } from "src/types/ApiResponse";
import { apiResponse } from "src/utils/api";

@Controller("/api/source")
export class SourceController {
    constructor(private sourceService: SourceService) {}

    @Public()
    @Post("/:id")
    @UseGuards(ApiKeyGuard)
    @UsePipes(new ZodValidationPipe(createSourceBody))
    async create(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: CreateSourceBody,
    ): Promise<ApiResponse<CreateSourceResponse>> {
        const res = await this.sourceService.create({ ...body, organizationId: id });

        return apiResponse("source created", res);
    }
}
