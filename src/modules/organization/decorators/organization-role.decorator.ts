import { SetMetadata } from "@nestjs/common";
import { Role } from "@prisma/client";

export const OrganizationRoles = (...roles: Role[]) => SetMetadata("roles", roles);
