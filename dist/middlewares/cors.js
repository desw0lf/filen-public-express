import cors from "cors";
import { getBucketName } from "../utils/get-bucket-name.js";
import { parseJSON } from "../utils/parse-json.js";
import {} from "express";
import {} from "../index.js";
function getOriginList(origin) {
    if (typeof origin === "string") {
        return origin.split(",");
    }
    if (Array.isArray(origin) && origin.every((value) => typeof value === "string")) {
        return origin;
    }
    return [];
}
async function readCorsFile(sdk, path) {
    try {
        const content = await sdk.fs().readFile({ path });
        return content.toString("utf-8");
    }
    catch {
        return "{}";
    }
}
async function getCorsOrigin(sdk, path, cacheEntry, now) {
    const def = { hit: false, origins: [] };
    if (path.startsWith("/public_/")) {
        return new Promise((resolve) => { resolve(def); });
    }
    if (cacheEntry && cacheEntry.expiresAt > now) {
        return new Promise((resolve) => { resolve({ hit: true, origins: cacheEntry.origins }); });
    }
    try {
        const content = await readCorsFile(sdk, path);
        const json = parseJSON(content, {});
        return { hit: false, origins: getOriginList(json.origin) };
    }
    catch {
        return def;
    }
}
export const createCorsMiddleware = (server, defaultOptions) => {
    return cors(async (req, callback) => {
        try {
            const { sdk, config, corsBucketCache, updateCorsCache } = server;
            const reqWithInitialBucket = { params: { bucket: req.path.split("/")[1] || "" } };
            const bucket = getBucketName(reqWithInitialBucket, config);
            const path = "/" + bucket + "/" + config.corsBucketFileName;
            const now = Date.now();
            const { hit, origins } = await getCorsOrigin(sdk, path, corsBucketCache.get(bucket), now);
            updateCorsCache(bucket, origins, now, hit);
            const allowedOrigins = origins.length > 0 ? origins : getOriginList(defaultOptions.origin);
            const corsOptions = {
                ...defaultOptions,
                origin: (origin, cb) => {
                    if (!origin || allowedOrigins[0] === "*" || allowedOrigins.includes(origin)) {
                        cb(null, true);
                    }
                    else {
                        cb(new Error("Not allowed by CORS"));
                    }
                },
            };
            callback(null, corsOptions);
        }
        catch (error) {
            console.error("CORS error:", error);
            callback(null, { origin: false });
        }
    });
};
