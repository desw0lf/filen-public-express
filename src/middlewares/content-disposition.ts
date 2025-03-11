import { type Response, type Request, type NextFunction } from "express";

function getStringHeaders<T extends string>(res: Response, keys: T[]): Record<T, string> {
  return keys.reduce((acc, key) => {
    const value = res.getHeader(key);
    return {
      ...acc,
      [key]: typeof value === "string" ? value : ""
    }
  }, {} as Record<T, string>);
} 

export const contentDispositionMiddleware = (downloadFileParam: string | undefined | null | false) => (req: Request, res: Response, _next: NextFunction) => {
  // TODO: maybe add a whitelist/blacklist per mime type etc (.avi for IOS needs to be attachment)
  const headers = getStringHeaders(res, ["Content-Disposition", "Content-Type", "Content-Length", "User-Agent"]);
  const isDownloadAllowed = downloadFileParam ? req.query[downloadFileParam] === "1" || req.query[downloadFileParam] === "true" : false;
  if (!res.headersSent && !isDownloadAllowed && headers["Content-Disposition"].startsWith("attachment")) {
    const suffix = headers["Content-Disposition"].split(";")[1];
    res.setHeader("Content-Disposition", "inline" + (suffix ? `;${suffix}` : ""));
  }
  const mime = headers["Content-Type"];
  // allows .mkv to be played inline directly in browser
  if (mime === "video/x-matroska" && headers["Content-Disposition"].includes(".mkv")) {
    res.setHeader("Content-Type", "video/webm");
  }
  if (res.statusCode === 200) {
    // in case Content-Length is stripped (e.g. by cloudflare compression)
    res.setHeader("X-Decompressed-Content-Length", headers["Content-Length"]);
    // don't compress .mp4 for iOS, as it breaks the ability to be played inline directly in browser (e.g. fixes cloudflare .mp4 not playing in iOS browsers)
    if (["video/mp4"].includes(mime) && (headers["User-Agent"].includes("iPhone") || headers["User-Agent"].includes("iPad"))) {
      res.setHeader("Content-Encoding", "identity");
    }
  }
};