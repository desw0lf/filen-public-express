import { type Response, type Request, type NextFunction } from "express";

export const errors = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);

  const statusCode = err.statusCode || 500;
  res.sendStatus(statusCode);
};