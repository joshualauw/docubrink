export interface GetAiMonthlyUsageDto {
    organizationId: number;
    startDate: Date;
    endDate: Date;
}

export type GetAiMonthlyUsageResponse = number;

export interface UpdateAiMonthlyUsageDto {
    organizationId: number;
    totalTokenCost: number;
}
