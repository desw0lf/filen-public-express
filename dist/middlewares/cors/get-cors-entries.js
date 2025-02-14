import { isArray, isArrayOfType, isObject } from "../../utils/is-type.js";
import { parseJSON } from "../../utils/parse-json.js";
import {} from "../../index.js";
async function readCorsFile(sdk, path) {
    try {
        const content = await sdk.fs().readFile({ path });
        return content.toString("utf-8");
    }
    catch {
        return "[]";
    }
}
export function parseOriginList(origin) {
    if (typeof origin === "string") {
        return origin.split(",");
    }
    if (isArrayOfType(origin, "string")) {
        return origin;
    }
    return [];
}
function parseCorsEntries(json) {
    if (!isArray(json)) {
        return [];
    }
    return json.reduce((acc, entry) => {
        if (isObject(entry) && isArrayOfType(entry.AllowedMethods, "string")) {
            const origins = parseOriginList(entry.AllowedOrigins);
            return [...acc, {
                    AllowedMethods: entry.AllowedMethods.map((method) => method.toUpperCase()),
                    AllowedOrigins: origins,
                }];
        }
        return acc;
    }, []);
}
export function findCorsEntryByMethod(entries, method) {
    const joinedEntry = entries.reduce((acc, entry) => {
        if (entry.AllowedMethods.includes(method)) {
            acc.AllowedOrigins = acc.AllowedOrigins.concat(entry.AllowedOrigins);
            return acc;
        }
        return acc;
    }, { AllowedOrigins: [], AllowedMethods: [method] });
    return joinedEntry.AllowedMethods.includes("*") ? { ...joinedEntry, AllowedMethods: ["*"] } : joinedEntry;
}
export async function readAndParseCorsEntries(sdk, path) {
    const content = await readCorsFile(sdk, path);
    const json = parseJSON(content, []);
    return parseCorsEntries(json);
}
