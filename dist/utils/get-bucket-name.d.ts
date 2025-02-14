import { type Request } from "express";
import { type F3PublicServerConfig } from "../index.ts";
export declare const getBucketName: (req: Request, config: Pick<F3PublicServerConfig, "masterBucket">) => string;
