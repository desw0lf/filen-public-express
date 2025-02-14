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
        req.params.bucket = getBucketName(req, this.server.config);
        return super.handle(req, res, next);
    }
}
export default EnhancedGetObject;
