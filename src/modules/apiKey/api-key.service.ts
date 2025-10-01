import dayjs from "dayjs";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { BcryptService } from "src/core/security/bcrypt/bcrypt.service";
import { CreateApiKeyDto, CreateApiKeyResponse } from "src/modules/apiKey/dtos/CreateApiKey";
import { DeleteApiKeyDto, DeleteApiKeyResponse } from "src/modules/apiKey/dtos/DeleteApiKey";
import { UpdateApiKeyDto, UpdateApiKeyResponse } from "src/modules/apiKey/dtos/UpdateApiKey";
import { genRandomAlphanum } from "src/utils/common";
import { GetAllApiKeyDto, GetAllApiKeyResponse } from "src/modules/apiKey/dtos/GetAllApiKey";
import { GetDetailApiKeyDto, GetDetailApiKeyResponse } from "src/modules/apiKey/dtos/GetDetailApiKey";

@Injectable()
export class ApiKeyService {
    constructor(
        private prismaService: PrismaService,
        private bcryptService: BcryptService,
    ) {}

    async getAll(payload: GetAllApiKeyDto): Promise<GetAllApiKeyResponse> {
        const apiKeys = await this.prismaService.apiKey.findMany({
            where: { organizationId: payload.organizationId },
            select: { apiKeyId: true, name: true, isActive: true },
        });

        return apiKeys;
    }

    async getDetail(payload: GetDetailApiKeyDto): Promise<GetDetailApiKeyResponse> {
        const apiKey = await this.prismaService.apiKey.findFirstOrThrow({
            where: { apiKeyId: payload.apiKeyId },
            select: { apiKeyId: true, name: true, scopes: true, isActive: true },
        });

        return apiKey;
    }

    async create(payload: CreateApiKeyDto): Promise<CreateApiKeyResponse> {
        const generatedKey = "sk_" + genRandomAlphanum(64);

        const apiKey = await this.prismaService.apiKey.create({
            data: {
                organizationId: payload.organizationId,
                scopes: payload.scopes,
                name: payload.name,
                isActive: true,
                keyHash: await this.bcryptService.hash(generatedKey),
            },
        });

        return { apiKeyId: apiKey.apiKeyId, generatedKey, createdAt: apiKey.createdAt.toISOString() };
    }

    async update(payload: UpdateApiKeyDto): Promise<UpdateApiKeyResponse> {
        const apiKey = await this.prismaService.apiKey.update({
            where: { apiKeyId: payload.apiKeyId },
            data: {
                name: payload.name,
                isActive: payload.isActive,
                scopes: payload.scopes,
            },
        });

        return { apiKeyId: apiKey.apiKeyId, updatedAt: apiKey.updatedAt.toISOString() };
    }

    async delete(payload: DeleteApiKeyDto): Promise<DeleteApiKeyResponse> {
        const apiKey = await this.prismaService.apiKey.delete({
            where: { apiKeyId: payload.apiKeyId },
        });

        return { apiKeyId: apiKey.apiKeyId, timestamp: dayjs().toISOString() };
    }
}
