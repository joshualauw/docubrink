export interface CreateCheckoutMetadata {
    organizationId: number;
    planId: number;
}

export interface CreateCheckoutDto {
    priceId: string;
    customerId: string;
    metadata: CreateCheckoutMetadata;
}
