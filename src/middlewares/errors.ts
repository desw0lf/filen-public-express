import { type Response, type Request, type NextFunction } from "express";
import { Responses } from "@filen/s3/dist/responses.js";
import type { ErrorWithStatus } from "../utils/error.ts";

export const errors = async (err: ErrorWithStatus, req: Request, res: Response, _next: NextFunction) => {
  if (!err) {
    return;
  }
  const origin = req.headers["origin"] || req.headers["referer"] || "?";
  console.error(`[ERROR] ${err.message} <IP: ${req.ip}> <Origin/Referer: ${origin}> <Path: ${req.path}>`);

  const statusCode = err.statusCode || 500;
  // res.sendStatus(statusCode);
  await Responses.error(res, statusCode, err.message, err.description);
};