import { type Response, type Request, type NextFunction } from "express";

export const contentDispositionMiddleware = (_req: Request, res: Response, _next: NextFunction) => {
  // maybe add a whitelist/blacklist per mime type etc
  const contentDispositionHeader = res.getHeader("Content-Disposition");
  if (!res.headersSent && typeof contentDispositionHeader === "string" && contentDispositionHeader.startsWith("attachment")) {
    res.setHeader("Content-Disposition", "inline");
  }
};