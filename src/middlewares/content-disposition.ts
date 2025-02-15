import { type Response, type Request, type NextFunction } from "express";

export const contentDispositionMiddleware = (downloadFileParam: string | undefined) => (req: Request, res: Response, _next: NextFunction) => {
  // maybe add a whitelist/blacklist per mime type etc
  const contentDispositionHeader = res.getHeader("Content-Disposition");
  const isDownloadAllowed = downloadFileParam ? req.query[downloadFileParam] === "1" || req.query[downloadFileParam] === "true" : false;
  if (!res.headersSent && !isDownloadAllowed && typeof contentDispositionHeader === "string" && contentDispositionHeader.startsWith("attachment")) {
    res.setHeader("Content-Disposition", "inline");
  }
};