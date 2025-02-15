import { type Request, type Response, type NextFunction } from "express";
import { GetObject } from "@filen/s3/dist/handlers/getObject.js";
import { getBucketName } from "../utils/get-bucket-name.ts";
import { type Server, type F3PublicServerConfig } from "../index.ts";

export class EnhancedGetObject extends GetObject {
  public constructor(server: Server) {
    super(server as any);
    this.handle = this.handle.bind(this);
  }

  public async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const config: F3PublicServerConfig = (this as any).server.config;
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