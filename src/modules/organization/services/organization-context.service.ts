import { Injectable, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.REQUEST })
export class OrganizationContext {
    private organizationId: number;

    set(organizationId: number) {
        this.organizationId = organizationId;
    }

    get(): number {
        return this.organizationId;
    }
}
