import cors from "cors";
import { getBucketName } from "../../utils/get-bucket-name.js";
import { readAndParseCorsEntries, findCorsEntryByMethod, parseOriginList } from "./get-cors-entries.js";
import {} from "express";
import {} from "../../index.js";
import { createError } from "../../utils/error.js";
async function getCorsEntries(sdk, path, cacheEntry, method, now) {
    if (cacheEntry && cacheEntry.expiresAt > now) {
        return { hit: true, entries: cacheEntry.entries };
    }
    try {
        const entries = await readAndParseCorsEntries(sdk, path);
        return { hit: false, entries };
    }
    catch {
        return { hit: false, entries: [findCorsEntryByMethod([], method)] };
    }
}
export const createCorsMiddleware = (server, defaultOptions) => {
    const { sdk, config, corsBucketCache, updateCorsCache } = server;
    async function findCorsEntry(req, bucket) {
        const path = "/" + bucket + "/" + config.corsBucketFileName;
        const now = Date.now();
        const { hit, entries } = await getCorsEntries(sdk, path, corsBucketCache.get(bucket), req.method, now);
        updateCorsCache(bucket, entries, now, hit);
        return findCorsEntryByMethod(entries, req.method);
    }
    return cors(async (req, callback) => {
        try {
            const bucket = getBucketName({ params: { bucket: req.path.split("/")[1] || "" } }, config);
            const { AllowedOrigins } = bucket === "public_" ? { AllowedOrigins: ["*"] } : await findCorsEntry(req, bucket);
            const allowedOrigins = AllowedOrigins.length > 0 ? AllowedOrigins : parseOriginList(defaultOptions.origin);
            const corsOptions = {
                ...defaultOptions,
                origin: (origin, cb) => {
                    if (!origin || allowedOrigins[0] === "*" || allowedOrigins.includes(origin)) {
                        cb(null, true);
                    }
                    else {
                        cb(createError(403, "Access Denied"));
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
