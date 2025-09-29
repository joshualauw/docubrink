import { Body, Controller, Delete, Param, ParseIntPipe, Post, Put, UseGuards, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { Public } from "src/modules/auth/decorators/public.decorator";
import { ApiKeyGuard } from "src/modules/organization/guards/api-key.guard";
import { CreateSourceBody, createSourceBody, CreateSourceResponse } from "src/modules/source/dtos/CreateSource";
import { DeleteSourceResponse } from "src/modules/source/dtos/DeleteSource";
import { updateSourceBody, UpdateSourceBody, UpdateSourceResponse } from "src/modules/source/dtos/UpdateSource";
import { SourceService } from "src/modules/source/source.service";
import { ApiResponse } from "src/types/ApiResponse";
import { apiResponse } from "src/utils/api";

@Controller("/api/:organizationId/source")
export class SourceController {
    constructor(private sourceService: SourceService) {}

    @Public()
    @Post()
    @UseGuards(ApiKeyGuard)
    @UsePipes(new ZodValidationPipe(createSourceBody))
    async create(
        @Param("organizationId", ParseIntPipe) organizationId: number,
        @Body() body: CreateSourceBody,
    ): Promise<ApiResponse<CreateSourceResponse>> {
        const res = await this.sourceService.create({ ...body, organizationId });

        return apiResponse("source created", res);
    }

    @Public()
    @Put("/:sourceId")
    @UseGuards(ApiKeyGuard)
    @UsePipes(new ZodValidationPipe(updateSourceBody))
    async update(
        @Param("sourceId", ParseIntPipe) sourceId: number,
        @Body() body: UpdateSourceBody,
    ): Promise<ApiResponse<UpdateSourceResponse>> {
        const res = await this.sourceService.update({ ...body, sourceId });

        return apiResponse("source updated", res);
    }

    @Public()
    @Delete("/:sourceId")
    @UseGuards(ApiKeyGuard)
    async delete(@Param("sourceId", ParseIntPipe) sourceId: number): Promise<ApiResponse<DeleteSourceResponse>> {
        const res = await this.sourceService.delete({ sourceId });

        return apiResponse("source deleted", res);
    }
}
