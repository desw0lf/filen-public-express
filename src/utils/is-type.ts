export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isArrayOfType<T extends "string" | "number" | "boolean" | "bigint" | "symbol" | "undefined" | "object" | "function">(
  value: unknown,
  type: T
): value is Array<{ string: string; number: number; boolean: boolean; bigint: bigint; symbol: symbol; undefined: undefined; object: object; function: Function }[T]> {
  return Array.isArray(value) && value.every((item) => typeof item === type);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && !isArray(value) && value !== null;
}