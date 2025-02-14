import { type Request } from "express";
import { type F3PublicServerConfig } from "../index.ts";

export const getBucketName = (req: Request, config: Pick<F3PublicServerConfig, "masterBucket">): string => {
  const master = !config.masterBucket ? undefined : config.masterBucket.startsWith("public_") ? config.masterBucket : `public_${config.masterBucket}`;
  return master || `public_${req.params.bucket}`;
}