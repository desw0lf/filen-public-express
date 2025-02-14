export function isArray(value) {
    return Array.isArray(value);
}
export function isArrayOfType(value, type) {
    return Array.isArray(value) && value.every((item) => typeof item === type);
}
export function isObject(value) {
    return typeof value === "object" && !isArray(value) && value !== null;
}
