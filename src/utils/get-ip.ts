import { type Request } from "express";

export const getIp = (req: Request, headerOrIp?: string): string => {
  if (headerOrIp === "ip") return req.ip;
  if (typeof headerOrIp === "string") return req.headers[headerOrIp] as string;
  return req.headers["cf-connecting-ip"] as string || req.ip || req.headers["x-forwarded-for"] as string || req.headers["x-real-ip"] as string;
};