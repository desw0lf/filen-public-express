import { type Request, type Response, type NextFunction } from "express";
import { GetObject } from "@filen/s3/dist/handlers/getObject.js";
import { getBucketName } from "../utils/get-bucket-name.ts";
import { type Server } from "../index.ts";

export class EnhancedGetObject extends GetObject {
  public constructor(server: Server) {
    super(server as any);
    this.handle = this.handle.bind(this);
  }

  private modifyResponseHeaders(res: Response) {
    // maybe only for images/videos etc, todo blacklist / whitelist
    res.setHeader("Content-Disposition", "inline");
  }

  public async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    req.params.bucket = getBucketName(req, (this as any).server.config);
    await super.handle(req, res, next);
    this.modifyResponseHeaders(res);
  }
}

export default EnhancedGetObject;