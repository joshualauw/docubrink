export interface CreateCheckoutMetadata {
    organizationId: number;
    planId: number;
}

export interface CreateCheckoutDto {
    priceId: string;
    email: string;
    metadata: CreateCheckoutMetadata;
}
