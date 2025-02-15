import { type Response, type Request, type NextFunction } from "express";
import type { ErrorWithStatus } from "../utils/error.ts";
export declare const errors: (err: ErrorWithStatus, req: Request, res: Response, _next: NextFunction) => Promise<void>;
