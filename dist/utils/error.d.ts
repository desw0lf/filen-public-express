export interface ErrorWithStatus extends Error {
    statusCode: number;
    description: string;
}
export declare function createError(statusCode: number, message?: string, description?: string): ErrorWithStatus;
