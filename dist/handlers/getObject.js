import {} from "express";
import { GetObject } from "@filen/s3/dist/handlers/getObject.js";
import { getBucketName } from "../utils/get-bucket-name.js";
import {} from "../index.js";
export class EnhancedGetObject extends GetObject {
    constructor(server) {
        super(server);
        this.handle = this.handle.bind(this);
    }
    async handle(req, res, next) {
        const config = this.server.config;
        if (config.downloadFileParam && req.query[config.downloadFileParam] && Object.keys(req.query).length <= 1) {
            // allow only one query param that was set
            req.url = req.url.split("?")[0];
        }
        req.params.bucket = getBucketName(req, config);
        await super.handle(req, res, next);
        next();
    }
}
export default EnhancedGetObject;
