import type { FilenPublicServerConfig, LoggerOptions, CorsOptions } from "./types.ts";

export const defaultPort = process.env.PORT || 1700;

export const defaultCorsOptions: CorsOptions = {
  origin: "*",
  methods: "GET",
};

export const defaultConfig: FilenPublicServerConfig = {
  expressTrustProxy: false,
  corsBucketFileName: ".filen-public.json",
  corsBucketCacheTTLMinutes: 10,
  downloadFileParam: "dl"
};

export const defaultLoggerOptions: LoggerOptions = {
  level: "info",
  logsPath: "./logs/filen-public-server",
  size: "10M",
  interval: "7d",
  compress: "gzip",
  enableConsole: true,
  enableFileLogging: true
};
