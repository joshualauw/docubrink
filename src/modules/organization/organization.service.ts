import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { CreateOrganizationDto, CreateOrganizationResponse } from "src/modules/organization/dtos/CreateOrganization";

@Injectable()
export class OrganizationService {
    constructor(private prismaService: PrismaService) {}

    async create(payload: CreateOrganizationDto): Promise<CreateOrganizationResponse> {
        const organizationCountByUser = await this.prismaService.organizationUser.count({
            where: {
                userId: payload.userId,
                role: "ADMIN",
            },
        });

        if (organizationCountByUser == 3) throw new BadRequestException("maximum organization created");

        const organization = await this.prismaService.organization.create({
            data: {
                name: payload.name,
                description: payload.name,
                organizationUser: {
                    create: {
                        userId: payload.userId,
                        role: "ADMIN",
                    },
                },
            },
        });

        return { organizationId: organization.organizationId, createdAt: organization.createdAt.toISOString() };
    }
}
