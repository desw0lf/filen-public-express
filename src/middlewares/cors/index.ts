import cors from "cors";
import { getBucketName } from "../../utils/get-bucket-name.ts";
import { readAndParseCorsEntries, findCorsEntryByMethod, parseOriginList, type CorsEntry } from "./get-cors-entries.ts";
import { type Request } from "express";
import { type Server } from "../../index.ts";
import { createError, type ErrorWithStatus } from "../../utils/error.ts";


type CorsOptions = Record<string, any>;


async function getCorsEntries(sdk: Server["sdk"], path: string, cacheEntry: ReturnType<Server["corsBucketCache"]["get"]>, method: string, now: number): Promise<{ hit: boolean; entries: CorsEntry[] }> {
  if (cacheEntry && cacheEntry.expiresAt > now) {
    return { hit: true, entries: cacheEntry.entries };
  }
  try {
    const entries = await readAndParseCorsEntries(sdk, path);
    return { hit: false, entries };
  } catch {
    return  { hit: false, entries: [findCorsEntryByMethod([], method)] };
  }
}

function isAllowed(allowedOrigins: string[], { origin, referer }: { origin?: string; referer?: string }): boolean {
  if (allowedOrigins[0] === "*") return true;
  if (!origin && !referer) return true;
  if (origin && allowedOrigins.includes(origin)) return true;
  if (referer && allowedOrigins.includes(referer)) return true;
  return false;
}

export const createCorsMiddleware = (server: Server, defaultOptions: CorsOptions) => {
  const { sdk, config, corsBucketCache, updateCorsCache } = server;

  async function findCorsEntry(req: Request, bucket: string) {
    const path = "/" + bucket + "/" + config.corsBucketFileName;
    const now = Date.now();
    const { hit, entries } = await getCorsEntries(sdk, path, corsBucketCache.get(bucket), req.method, now);
    updateCorsCache(bucket, entries, now, hit);
    return findCorsEntryByMethod(entries, req.method);
  }

  return cors(async (req: Request, callback: (error: ErrorWithStatus | null, options?: CorsOptions) => void) => {
      try {
        const bucket = getBucketName({ params: { bucket: req.path.split("/")[1] || "" }} as any, config);
        const { AllowedOrigins } = bucket === "public_" ? { AllowedOrigins: ["*"] } : await findCorsEntry(req, bucket);
        const allowedOrigins = AllowedOrigins.length > 0 ? AllowedOrigins : parseOriginList(defaultOptions.origin);

        const referer = req.headers.referer ? new URL(req.headers.referer).origin : null;

        const corsOptions: CorsOptions = {
          ...defaultOptions,
          origin: (origin: string | null | undefined, cb: (err: Error | null, origin?: boolean) => void) => {
            if (isAllowed(allowedOrigins, { origin, referer })) {
              cb(null, true);
            } else {
              cb(createError(403, "Access Denied"));
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