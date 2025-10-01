import { SetMetadata } from "@nestjs/common";
import { ApiKeyScope } from "src/types/ApiKeyScope";

export const ApiKeyScopes = (...scopes: ApiKeyScope[]) => SetMetadata("scopes", scopes);
