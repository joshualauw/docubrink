import dayjs from "dayjs";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { CreateApiKeyDto, CreateApiKeyResponse } from "src/modules/apiKey/dtos/CreateApiKey";
import { DeleteApiKeyDto, DeleteApiKeyResponse } from "src/modules/apiKey/dtos/DeleteApiKey";
import { UpdateApiKeyDto, UpdateApiKeyResponse } from "src/modules/apiKey/dtos/UpdateApiKey";
import { genRandomAlphanum } from "src/utils/common";
import { GetAllApiKeyResponse } from "src/modules/apiKey/dtos/GetAllApiKey";
import { GetDetailApiKeyDto, GetDetailApiKeyResponse } from "src/modules/apiKey/dtos/GetDetailApiKey";
import { CryptoService } from "src/core/security/crypto/crypto.service";
import { OrganizationUserContextService } from "src/modules/organization/services/organization-user-context.service";

@Injectable()
export class ApiKeyService {
    constructor(
        private prismaService: PrismaService,
        private cryptoService: CryptoService,
        private organizationUserContextService: OrganizationUserContextService,
    ) {}

    async getAll(): Promise<GetAllApiKeyResponse> {
        const organizationUser = this.organizationUserContextService.get();

        const apiKeys = await this.prismaService.apiKey.findMany({
            where: { organizationId: organizationUser.organizationId },
            select: { apiKeyId: true, name: true, isActive: true },
        });

        return apiKeys;
    }

    async getDetail(payload: GetDetailApiKeyDto): Promise<GetDetailApiKeyResponse> {
        const organizationUser = this.organizationUserContextService.get();

        const apiKey = await this.prismaService.apiKey.findFirstOrThrow({
            where: { apiKeyId: payload.apiKeyId, organizationId: organizationUser.organizationId },
            select: { apiKeyId: true, name: true, scopes: true, isActive: true },
        });

        return apiKey;
    }

    async create(payload: CreateApiKeyDto): Promise<CreateApiKeyResponse> {
        const organizationUser = this.organizationUserContextService.get();
        const generatedKey = "sk_" + genRandomAlphanum(64);

        const apiKey = await this.prismaService.apiKey.create({
            data: {
                organizationId: organizationUser.organizationId,
                scopes: payload.scopes,
                name: payload.name,
                isActive: true,
                keyHash: this.cryptoService.hash(generatedKey),
            },
        });

        return { apiKeyId: apiKey.apiKeyId, generatedKey, createdAt: apiKey.createdAt.toISOString() };
    }

    async update(payload: UpdateApiKeyDto): Promise<UpdateApiKeyResponse> {
        const organizationUser = this.organizationUserContextService.get();

        const apiKey = await this.prismaService.apiKey.update({
            where: { apiKeyId: payload.apiKeyId, organizationId: organizationUser.organizationId },
            data: {
                name: payload.name,
                isActive: payload.isActive,
                scopes: payload.scopes,
            },
        });

        return { apiKeyId: apiKey.apiKeyId, updatedAt: apiKey.updatedAt.toISOString() };
    }

    async delete(payload: DeleteApiKeyDto): Promise<DeleteApiKeyResponse> {
        const organizationUser = this.organizationUserContextService.get();

        const apiKey = await this.prismaService.apiKey.delete({
            where: { apiKeyId: payload.apiKeyId, organizationId: organizationUser.organizationId },
        });

        return { apiKeyId: apiKey.apiKeyId, timestamp: dayjs().toISOString() };
    }
}
