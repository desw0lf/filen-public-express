import cors from "cors";
import { getBucketName } from "../../utils/get-bucket-name.ts";
import { readAndParseCorsEntries, findCorsEntryByMethod, parseOriginList, type CorsEntry } from "./get-cors-entries.ts";
import { type Request } from "express";
import { type Server } from "../../index.ts";


type CorsOptions = Record<string, any>;


async function getCorsEntries(sdk: Server["sdk"], path: string, cacheEntry: ReturnType<Server["corsBucketCache"]["get"]>, method: string, now: number): Promise<{ hit: boolean; entries: CorsEntry[] }> {
  const def = { hit: false, entries: [findCorsEntryByMethod([], method)] };
  if (path.startsWith("/public_/")) { // no bucket
    return new Promise((resolve) => { resolve(def); });
  }
  if (cacheEntry && cacheEntry.expiresAt > now) {
    return new Promise((resolve) => { resolve({ hit: true, entries: cacheEntry.entries }); });
  }
  try {
    const entries = await readAndParseCorsEntries(sdk, path);
    return { hit: false, entries }
  } catch {
    return def;
  }
}

export const createCorsMiddleware = (server: Server, defaultOptions: CorsOptions) => {
  return cors(async (req: Request, callback: (error: Error | null, options?: CorsOptions) => void) => {
      try {
        const { sdk, config, corsBucketCache, updateCorsCache } = server;
        const bucket = getBucketName({ params: { bucket: req.path.split("/")[1] || "" }} as any, config);
        const path = "/" + bucket + "/" + config.corsBucketFileName;
        const now = Date.now();
        const { hit, entries } = await getCorsEntries(sdk, path, corsBucketCache.get(bucket), req.method, now);
        console.log(hit, entries);
        updateCorsCache(bucket, entries, now, hit);
        const { AllowedOrigins } = findCorsEntryByMethod(entries, req.method);
        const allowedOrigins = AllowedOrigins.length > 0 ? AllowedOrigins : parseOriginList(defaultOptions.origin);

        const corsOptions: CorsOptions = {
          ...defaultOptions,
          origin: (origin: string | null | undefined, cb: (err: Error | null, origin?: boolean) => void) => {
            if (!origin || allowedOrigins[0] === "*" || allowedOrigins.includes(origin)) {
              cb(null, true);
            } else {
              cb(new Error("CORS"));
            }
          },
        };

        callback(null, corsOptions);
      } catch (error) {
        console.error("CORS error:", error);
        callback(null, { origin: false });
      }
  });
};