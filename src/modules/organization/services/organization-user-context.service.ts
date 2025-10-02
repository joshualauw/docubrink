import { Injectable, Scope } from "@nestjs/common";
import { OrganizationUserContext } from "src/modules/organization/dtos/OrganizationUserContext";

@Injectable({ scope: Scope.REQUEST })
export class OrganizationUserContextService {
    private organizationUser: OrganizationUserContext;

    set(organizationUser: OrganizationUserContext) {
        this.organizationUser = organizationUser;
    }

    get(): OrganizationUserContext {
        return this.organizationUser;
    }
}
