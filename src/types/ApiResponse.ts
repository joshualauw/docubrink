export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    timestamp: string;
    path?: string;
    errorList?: string[];
    errorCode?: string;
}

export type ApiReturn<T> = Promise<ApiResponse<T>>;
