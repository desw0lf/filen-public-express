import { isArray, isArrayOfType, isObject } from "../../utils/is-type.ts";
import { parseJSON } from "../../utils/parse-json.ts";
import { type Server } from "../../server.ts";
import { type CorsEntry } from "../../types.ts";

async function readCorsFile(sdk: Server["sdk"], path: string): Promise<string> {
  try {
    const content: Buffer = await sdk.fs().readFile({ path });
    return content.toString("utf-8");
  } catch {
    return "[]";
  }
}

export function parseOriginList(origin: unknown): string[] {
  if (typeof origin === "string") {
    return origin.split(",");
  }
  if (isArrayOfType(origin, "string")) {
    return origin;
  }
  return [];
}

function parseCorsEntries(json: unknown): CorsEntry[] {
  if (!isArray(json)) {
    return [];
  }
  return json.reduce((acc: CorsEntry[], entry) => {
    if (isObject(entry) && isArrayOfType(entry.AllowedMethods, "string")) {
      const origins = parseOriginList(entry.AllowedOrigins);
      return [...acc, {
        AllowedMethods: entry.AllowedMethods.map((method) => method.toUpperCase()),
        AllowedOrigins: origins,
      }];
    }
    return acc;
  }, []) as CorsEntry[];
}

export function findCorsEntryByMethod(entries: CorsEntry[], method: string): CorsEntry {
  const joinedEntry = entries.reduce((acc: CorsEntry, entry) => {
    if (entry.AllowedMethods.includes(method)) {
      acc.AllowedOrigins = acc.AllowedOrigins.concat(entry.AllowedOrigins);
      return acc;
    }
    return acc;
  }, { AllowedOrigins: [], AllowedMethods: [method] }) as CorsEntry;
  return joinedEntry.AllowedMethods.includes("*") ? { ...joinedEntry, AllowedMethods: ["*"] } : joinedEntry;
}

export async function readAndParseCorsEntries(sdk: Server["sdk"], path: string): Promise<CorsEntry[]> {
  const content = await readCorsFile(sdk, path);
  const json = parseJSON<CorsEntry[]>(content, []);
  return parseCorsEntries(json);
}