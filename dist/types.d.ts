import type { User as OriginalUser } from "@filen/s3";
import { type FilenSDKConfig as OriginalFilenSDKConfig } from "@filen/sdk";
type RequiredBy<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type FilenSDKConfig = RequiredBy<OriginalFilenSDKConfig, "email" | "password">;
export type User = PartialBy<OriginalUser, "secretKeyId" | "accessKeyId">;
export type IgnoreRule = string | {
    startsWith?: string;
    endsWith: string;
    contains: string;
};
export type FilenPublicServerConfig = {
    expressTrustProxy?: boolean | number | string | string[];
    corsBucketFileName: string;
    corsBucketCacheTTLMinutes: number;
    corsBucketCachePurgeUrl?: string;
    masterBucket?: string;
    downloadFileParam?: string | null | false;
    ignoreList?: IgnoreRule[];
};
export interface CorsEntry {
    AllowedMethods: string[];
    AllowedOrigins: string[];
}
export type CorsOptions = Record<string, any>;
export type LogLevel = "info" | "debug" | "warn" | "error" | "trace" | "fatal";
export interface LoggerOptions {
    level: LogLevel;
    logsPath: string;
    size: string;
    interval: string;
    compress: string;
    enableConsole: boolean;
    enableFileLogging: boolean;
}
export {};
