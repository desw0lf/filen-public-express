export interface ErrorWithStatus extends Error {
  statusCode: number;
  description: string;
}

export function createError(statusCode: number, message = "?", description?: string): ErrorWithStatus {
  const error = new Error(message) as ErrorWithStatus;
  error.statusCode = statusCode;
  error.description = description || message;
  return error;
}