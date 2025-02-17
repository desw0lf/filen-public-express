import { type Response, type Request, type NextFunction } from "express";
import type { ErrorWithStatus } from "../utils/error.ts";
import { type Logger } from "../logger.ts";
export declare const errors: (logger: Logger) => (err: ErrorWithStatus, req: Request, res: Response, _next: NextFunction) => Promise<void>;
