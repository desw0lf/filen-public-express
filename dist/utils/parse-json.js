export function parseJSON(content, defaultValue = {}) {
    try {
        return JSON.parse(content);
    }
    catch {
        return defaultValue;
    }
}
