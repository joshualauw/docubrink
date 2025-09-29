import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { StripeService } from "src/core/payment/stripe/stripe.service";
import { BcryptService } from "src/core/security/bcrypt/bcrypt.service";
import { CreateApiKeyDto, CreateApiKeyResponse } from "src/modules/organization/dtos/CreateApiKey";
import { CreateOrganizationDto, CreateOrganizationResponse } from "src/modules/organization/dtos/CreateOrganization";
import { DeleteApiKeyDto, DeleteApiKeyResponse } from "src/modules/organization/dtos/DeleteApiKey";
import { UpdateApiKeyDto, UpdateApiKeyResponse } from "src/modules/organization/dtos/UpdateApiKey";
import { genRandomAlphanum } from "src/utils/common";

@Injectable()
export class OrganizationService {
    constructor(
        private prismaService: PrismaService,
        private stripeService: StripeService,
        private bcryptService: BcryptService,
    ) {}

    async create(payload: CreateOrganizationDto): Promise<CreateOrganizationResponse> {
        const organizationCountByUser = await this.prismaService.organizationUser.count({
            where: {
                userId: payload.userId,
                role: "ADMIN",
            },
        });

        if (organizationCountByUser == 3) throw new BadRequestException("maximum organization created");

        const basicPlan = await this.prismaService.plan.findFirstOrThrow({
            where: { name: "free" },
        });

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const organization = await this.prismaService.$transaction(async (tx) => {
            const organization = await tx.organization.create({
                data: {
                    name: payload.name,
                    description: payload.name,
                    email: payload.email,
                    stripeCustomerId: "",
                    organizationUser: {
                        create: {
                            userId: payload.userId,
                            role: "ADMIN",
                        },
                    },
                },
            });

            const customer = await this.stripeService.createCustomer({
                organizationId: organization.organizationId,
                organizationName: organization.name,
                organizationEmail: payload.email,
            });

            await tx.organization.update({
                where: { organizationId: organization.organizationId },
                data: { stripeCustomerId: customer.id },
            });

            const subscription = await this.stripeService.createSubscription({
                customerId: customer.id,
                priceId: basicPlan.stripePriceId,
            });

            await tx.subscription.create({
                data: {
                    organizationId: organization.organizationId,
                    planId: basicPlan.planId,
                    status: "ACTIVE",
                    startDate,
                    endDate,
                    stripeCustomerId: customer.id,
                    stripeSubscriptionId: subscription.id,
                },
            });

            return organization;
        });

        return { organizationId: organization.organizationId, createdAt: organization.createdAt.toISOString() };
    }

    async createApiKey(payload: CreateApiKeyDto): Promise<CreateApiKeyResponse> {
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

    async updateApiKey(payload: UpdateApiKeyDto): Promise<UpdateApiKeyResponse> {
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

    async deleteApiKey(payload: DeleteApiKeyDto): Promise<DeleteApiKeyResponse> {
        const apiKey = await this.prismaService.apiKey.delete({
            where: { apiKeyId: payload.apiKeyId },
        });

        return { apiKeyId: apiKey.apiKeyId };
    }
}
