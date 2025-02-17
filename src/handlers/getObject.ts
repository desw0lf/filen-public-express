import { type Request, type Response, type NextFunction } from "express";
import { GetObject } from "@filen/s3/dist/handlers/getObject.js";
import { getBucketName } from "../utils/get-bucket-name.ts";
import { createError } from "../utils/error.ts";
import { type Server } from "../server.ts";
import { type FilenPublicServerConfig, type IgnoreRule } from "../types.ts";

export class EnhancedGetObject extends GetObject {
  public constructor(server: Server) {
    super(server as any);
    this.handle = this.handle.bind(this);
  }

  private isFileIgnored(url: string, ignoreList: undefined | IgnoreRule[]): boolean {
    if (!ignoreList || ignoreList.length <= 0) {
      return false;
    }
    const fileName = url.split("/").pop();
    for (const rule of ignoreList) {
      if (typeof rule === "string" && fileName === rule) return true;
      if (typeof rule === "object") {
        if ("startsWith" in rule && fileName.startsWith(rule.startsWith)) return true;
        if ("endsWith" in rule && fileName.endsWith(rule.endsWith)) return true;
        if ("contains" in rule && fileName.includes(rule.contains)) return true;
      }
    }
    return false;
  }

  public async handle(req: Request, res: Response, next: NextFunction): Promise<any> {
    const config: FilenPublicServerConfig = (this as any).server.config;
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