export function parseJSON<T = Record<string, any>>(content: string, defaultValue = {} as T): T {
  try {
    return JSON.parse(content);
  } catch {
    return defaultValue;
  }
}