import {} from "express";
import { GetObject } from "@filen/s3/dist/handlers/getObject.js";
import { getBucketName } from "../utils/get-bucket-name.js";
import { createError } from "../utils/error.js";
import {} from "../server.js";
import {} from "../types.js";
export class EnhancedGetObject extends GetObject {
    constructor(server) {
        super(server);
        this.handle = this.handle.bind(this);
    }
    isFileIgnored(url, ignoreList) {
        if (!ignoreList || ignoreList.length <= 0) {
            return false;
        }
        const fileName = url.split("/").pop();
        for (const rule of ignoreList) {
            if (typeof rule === "string" && fileName === rule)
                return true;
            if (typeof rule === "object") {
                if ("startsWith" in rule && fileName.startsWith(rule.startsWith))
                    return true;
                if ("endsWith" in rule && fileName.endsWith(rule.endsWith))
                    return true;
                if ("contains" in rule && fileName.includes(rule.contains))
                    return true;
            }
        }
        return false;
    }
    async handle(req, res, next) {
        const config = this.server.config;
        const urlWithoutQuery = req.url.split("?")[0];
        if (config.downloadFileParam && req.query[config.downloadFileParam] && Object.keys(req.query).length <= 1) {
            // allow only one query param that was set
            req.url = urlWithoutQuery;
        }
        if (this.isFileIgnored(urlWithoutQuery, config.ignoreList)) {
            return next(createError(404, "NoSuchKey", "The specified key does not exist."));
        }
        req.params.bucket = getBucketName(req, config);
        await super.handle(req, res, next);
        next();
    }
}
export default EnhancedGetObject;
