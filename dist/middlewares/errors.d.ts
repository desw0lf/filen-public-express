import { type Response, type Request, type NextFunction } from "express";
import { type LoggerInstance } from "../logger.ts";
import type { ErrorWithStatus } from "../utils/error.ts";
export declare const errors: (logger: LoggerInstance) => (err: ErrorWithStatus, req: Request, res: Response, _next: NextFunction) => Promise<void>;
