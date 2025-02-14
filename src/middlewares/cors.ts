import cors from "cors";
import { getBucketName } from "../utils/get-bucket-name.ts";
import { parseJSON } from "../utils/parse-json.ts";
import { type Request } from "express";
import { type Server } from "../index.ts";

type CorsOptions = Record<string, any>;

function getOriginList(origin: unknown): string[] {
  if (typeof origin === "string") {
    return origin.split(",");
  }
  if (Array.isArray(origin) && origin.every((value) => typeof value === "string")) {
    return origin;
  }
  return [];
}

async function readCorsFile(sdk: Server["sdk"], path: string): Promise<string> {
  try {
    const content: Buffer = await sdk.fs().readFile({ path });
    return content.toString("utf-8");
  } catch {
    return "{}";
  }
}

async function getCorsOrigin(sdk: Server["sdk"], path: string, cacheEntry: ReturnType<Server["corsBucketCache"]["get"]>, now: number): Promise<{ hit: boolean; origins: string[] }> {
  const def = { hit: false, origins: [] };
  if (path.startsWith("/public_/")) {
    return new Promise((resolve) => { resolve(def); });
  }
  if (cacheEntry && cacheEntry.expiresAt > now) {
    return new Promise((resolve) => { resolve({ hit: true, origins: cacheEntry.origins }); });
  }
  try {
    const content = await readCorsFile(sdk, path);
    const json = parseJSON<CorsOptions>(content, {});
    return { hit: false, origins: getOriginList(json.origin) }
  } catch {
    return def;
  }
}

export const createCorsMiddleware = (server: Server, defaultOptions: CorsOptions) => {
  return cors(async (req: Request, callback: (error: Error | null, options?: CorsOptions) => void) => {
      try {
        const { sdk, config, corsBucketCache, updateCorsCache } = server;
        const reqWithInitialBucket = { params: { bucket: req.path.split("/")[1] || "" }};
        const bucket = getBucketName(reqWithInitialBucket as any, config);
        const path = "/" + bucket + "/" + config.corsBucketFileName;
        const now = Date.now();
        const { hit, origins } = await getCorsOrigin(sdk, path, corsBucketCache.get(bucket), now);
        updateCorsCache(bucket, origins, now, hit);
        const allowedOrigins = origins.length > 0 ? origins : getOriginList(defaultOptions.origin);

        const corsOptions: CorsOptions = {
          ...defaultOptions,
          origin: (origin: string | null | undefined, cb: (err: Error | null, origin?: boolean) => void) => {
            if (!origin || allowedOrigins[0] === "*" || allowedOrigins.includes(origin)) {
              cb(null, true);
            } else {
              cb(new Error("Not allowed by CORS"));
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