import { type Request, type Response, type NextFunction } from "express";
import { GetObject } from "@filen/s3/dist/handlers/getObject.js";
// import type Server from "../";

// type PublicInterface<T> = Pick<T, keyof T>;

type Server = any; // todo

export class EnhancedGetObject extends GetObject {
  public constructor(server: Server) {
    super(server);
    this.handle = this.handle.bind(this);
  }

  public async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { config } = (this as any).server as Server;
    const masterBucketName = config.selectBucketName ? config.selectBucketName.startsWith("public_") ? config.selectBucketName : `public_${config.selectBucketName}` : undefined;
    const updatedBucketName = masterBucketName || `public_${req.params.bucket}`;
    req.params.bucket = updatedBucketName;
    // todo check individual cors
    return super.handle(req, res, next);
  }
}

export default EnhancedGetObject;