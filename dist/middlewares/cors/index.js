import cors from "cors";
import { getBucketName } from "../../utils/get-bucket-name.js";
import { readAndParseCorsEntries, findCorsEntryByMethod, parseOriginList } from "./get-cors-entries.js";
import {} from "express";
import {} from "../../index.js";
async function getCorsEntries(sdk, path, cacheEntry, method, now) {
    const def = { hit: false, entries: [findCorsEntryByMethod([], method)] };
    if (path.startsWith("/public_/")) { // no bucket
        return new Promise((resolve) => { resolve(def); });
    }
    if (cacheEntry && cacheEntry.expiresAt > now) {
        return new Promise((resolve) => { resolve({ hit: true, entries: cacheEntry.entries }); });
    }
    try {
        const entries = await readAndParseCorsEntries(sdk, path);
        return { hit: false, entries };
    }
    catch {
        return def;
    }
}
export const createCorsMiddleware = (server, defaultOptions) => {
    return cors(async (req, callback) => {
        try {
            const { sdk, config, corsBucketCache, updateCorsCache } = server;
            const bucket = getBucketName({ params: { bucket: req.path.split("/")[1] || "" } }, config);
            const path = "/" + bucket + "/" + config.corsBucketFileName;
            const now = Date.now();
            const { hit, entries } = await getCorsEntries(sdk, path, corsBucketCache.get(bucket), req.method, now);
            console.log(hit, entries);
            updateCorsCache(bucket, entries, now, hit);
            const { AllowedOrigins } = findCorsEntryByMethod(entries, req.method);
            const allowedOrigins = AllowedOrigins.length > 0 ? AllowedOrigins : parseOriginList(defaultOptions.origin);
            const corsOptions = {
                ...defaultOptions,
                origin: (origin, cb) => {
                    if (!origin || allowedOrigins[0] === "*" || allowedOrigins.includes(origin)) {
                        cb(null, true);
                    }
                    else {
                        cb(new Error("CORS"));
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
