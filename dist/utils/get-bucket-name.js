import {} from "express";
import {} from "../index.js";
export const getBucketName = (req, config) => {
    const master = !config.masterBucket ? undefined : config.masterBucket.startsWith("public_") ? config.masterBucket : `public_${config.masterBucket}`;
    return master || `public_${req.params.bucket}`;
};
