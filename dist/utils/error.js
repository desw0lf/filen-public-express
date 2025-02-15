export function createError(statusCode, message = "?", description) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.description = description || message;
    return error;
}
