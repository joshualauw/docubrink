import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    UsePipes,
} from "@nestjs/common";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { ApiKeyScopes } from "src/modules/apiKey/decorators/api-key-scope.decorator";
import { ApiKeyGuard } from "src/modules/apiKey/guards/api-key.guard";
import { Public } from "src/modules/auth/decorators/public.decorator";
import { AskSourceBody, askSourceBody, AskSourceResponse } from "src/modules/source/dtos/AskSource";
import { CreateSourceBody, createSourceBody, CreateSourceResponse } from "src/modules/source/dtos/CreateSource";
import { DeleteSourceResponse } from "src/modules/source/dtos/DeleteSource";
import { GetAllSourceResponse } from "src/modules/source/dtos/GetAllSource";
import { GetDetailSourceResponse } from "src/modules/source/dtos/GetDetailSource";
import { updateSourceBody, UpdateSourceBody, UpdateSourceResponse } from "src/modules/source/dtos/UpdateSource";
import { SourceService } from "src/modules/source/source.service";
import { ApiResponse } from "src/types/ApiResponse";
import { apiResponse } from "src/utils/api";
import { SourceFileInterceptor } from "src/modules/source/interceptors/source-file.interceptor";

@Controller("/api/source")
export class SourceController {
    constructor(private sourceService: SourceService) {}

    @Public()
    @Get()
    @ApiKeyScopes("source.read")
    @UseGuards(ApiKeyGuard)
    async getAll(): Promise<ApiResponse<GetAllSourceResponse>> {
        const res = await this.sourceService.getAll();

        return apiResponse("get all source successful", res);
    }

    @Public()
    @Get(":sourceId")
    @ApiKeyScopes("source.read")
    @UseGuards(ApiKeyGuard)
    async getDetail(@Param("sourceId", ParseIntPipe) sourceId: number): Promise<ApiResponse<GetDetailSourceResponse>> {
        const res = await this.sourceService.getDetail({ sourceId });

        return apiResponse("get detail source successful", res);
    }

    @Public()
    @Post()
    @ApiKeyScopes("source.write")
    @UseGuards(ApiKeyGuard)
    @UsePipes(new ZodValidationPipe(createSourceBody))
    async create(@Body() body: CreateSourceBody): Promise<ApiResponse<CreateSourceResponse>> {
        const res = await this.sourceService.create(body);

        return apiResponse("source created", res);
    }

    @Public()
    @Post("upload")
    @ApiKeyScopes("source.write")
    @UseGuards(ApiKeyGuard)
    @UsePipes(new ZodValidationPipe(createSourceBody))
    @UseInterceptors(SourceFileInterceptor)
    async upload(
        @Body() body: CreateSourceBody,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<ApiResponse<CreateSourceResponse>> {
        if (!file) throw new BadRequestException("file is not provided");

        const res = await this.sourceService.create({ ...body, file });

        return apiResponse("source uploaded", res);
    }

    @Public()
    @Post("ask")
    @ApiKeyScopes("source.query")
    @UseGuards(ApiKeyGuard)
    @UsePipes(new ZodValidationPipe(askSourceBody))
    async ask(@Body() body: AskSourceBody): Promise<ApiResponse<AskSourceResponse>> {
        const res = await this.sourceService.ask(body);

        return apiResponse("ask successful", res);
    }

    @Public()
    @Put(":sourceId")
    @ApiKeyScopes("source.write")
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
    @Delete(":sourceId")
    @ApiKeyScopes("source.delete")
    @UseGuards(ApiKeyGuard)
    async delete(@Param("sourceId", ParseIntPipe) sourceId: number): Promise<ApiResponse<DeleteSourceResponse>> {
        const res = await this.sourceService.delete({ sourceId });

        return apiResponse("source deleted", res);
    }
}
