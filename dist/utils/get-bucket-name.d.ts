import { type Request } from "express";
import { type FilenPublicServerConfig } from "../index.ts";
export declare const getBucketName: (req: Request, config: Pick<FilenPublicServerConfig, "masterBucket">) => string;
