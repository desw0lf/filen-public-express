import type { User as OriginalUser } from "@filen/s3";
import { type FilenSDKConfig as OriginalFilenSDKConfig } from "@filen/sdk";

type RequiredBy<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type FilenSDKConfig = RequiredBy<OriginalFilenSDKConfig, "email" | "password">;

export type User = PartialBy<OriginalUser, "secretKeyId" | "accessKeyId">;

export type IgnoreRule  = string | { startsWith?: string; endsWith?: string; contains?: string };

export type FilenPublicServerConfig = {
  expressTrustProxy?: boolean | number | string | string[]; // https://express-rate-limit.mintlify.app/guides/troubleshooting-proxy-issues
  corsBucketFileName: string;
  corsBucketCacheTTLMinutes: number;
  corsBucketCachePurgeUrl?: string;
  masterBucket?: string; // name of the single bucket to use
  downloadFileParam?: string | null | false; // e.g. "dl", used as query param ".../file.pdf?dl=1" or ".../file.pdf?dl=true"
  ignoreList?: IgnoreRule[];
};

export type Method = string;

export interface CorsEntry {
  AllowedMethods: [Method]; // ("GET" | "PUT" | "POST" | "DELETE" | "HEAD")[]; // only ["GET"] supported
  AllowedOrigins: string[];
}

export interface CorsOptions {
  methods: "GET";
  origin: string | string[];
}

// logger

export type LogLevel = "info" | "debug" | "warn" | "error" | "trace" | "fatal";

export interface LoggerOptions {
  level: LogLevel; // Logging level (info, error, debug, etc.)
  logsPath: string; // Path for log files
  size: string; // Max log file size before rotation (e.g., "10M")
  interval: string; // Rotation interval (e.g., "7d")
  compress: string; // Compression format (e.g., "gzip")
  enableConsole: boolean; // Enable/disable logging to stdout
  enableFileLogging: boolean; // Enable/disable logging to a file
}