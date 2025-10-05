export interface GetAiMonthlyUsageDto {
    organizationId: number;
}

export type GetAiMonthlyUsageResponse = number;

export interface UpdateAiMonthlyUsageDto {
    organizationId: number;
    totalTokenCost: number;
}
