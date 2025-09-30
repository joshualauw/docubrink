import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { Public } from "src/modules/auth/decorators/public.decorator";
import { ApiKeyGuard } from "src/modules/organization/guards/api-key.guard";
import { AskSourceBody, askSourceBody, AskSourceResponse } from "src/modules/source/dtos/AskSource";
import { CreateSourceBody, createSourceBody, CreateSourceResponse } from "src/modules/source/dtos/CreateSource";
import { DeleteSourceResponse } from "src/modules/source/dtos/DeleteSource";
import { GetAllSourceResponse } from "src/modules/source/dtos/GetAllSource";
import { updateSourceBody, UpdateSourceBody, UpdateSourceResponse } from "src/modules/source/dtos/UpdateSource";
import { SourceService } from "src/modules/source/source.service";
import { ApiResponse } from "src/types/ApiResponse";
import { apiResponse } from "src/utils/api";

@Controller("/api/:organizationId/source")
export class SourceController {
    constructor(private sourceService: SourceService) {}

    @Public()
    @Get()
    @UseGuards(ApiKeyGuard)
    async getAll(
        @Param("organizationId", ParseIntPipe) organizationId: number,
    ): Promise<ApiResponse<GetAllSourceResponse>> {
        const res = await this.sourceService.getAll({ organizationId });

        return apiResponse("sources fetched", res);
    }

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
    @Post("ask")
    @UseGuards(ApiKeyGuard)
    @UsePipes(new ZodValidationPipe(askSourceBody))
    async ask(
        @Param("organizationId", ParseIntPipe) organizationId: number,
        @Body() body: AskSourceBody,
    ): Promise<ApiResponse<AskSourceResponse>> {
        const res = await this.sourceService.ask({ ...body, organizationId });

        return apiResponse("ask successful", res);
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
