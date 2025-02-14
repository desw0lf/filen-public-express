import { type Express } from "express";
import { FilenSDK, type FSStats, type FilenSDKConfig as OriginalFilenSDKConfig } from "@filen/sdk";
import http, { type IncomingMessage, type ServerResponse } from "http";
import { Logger } from "@filen/s3/dist/logger.js";
import type { ServerConfig, User as OriginalUser, RateLimit } from "@filen/s3";
import { type Socket } from "net";
import { type Duplex } from "stream";
type RequiredBy<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type FilenSDKConfig = RequiredBy<OriginalFilenSDKConfig, "email" | "password">;
export type User = PartialBy<OriginalUser, "secretKeyId" | "accessKeyId">;
export type F3PublicServerConfig = {
    corsBucketFileName: string;
    corsBucketCacheTTLMinutes: number;
    masterBucket?: string;
};
export declare class F3PublicExpress {
    readonly server: Express;
    readonly serverConfig: ServerConfig;
    readonly user: User;
    readonly sdk: FilenSDK;
    serverInstance: http.Server<typeof IncomingMessage, typeof ServerResponse>;
    connections: Record<string, Socket | Duplex>;
    rateLimit: RateLimit;
    logger: Logger;
    config: F3PublicServerConfig;
    corsBucketCache: Map<string, {
        origins: string[];
        expiresAt: number;
    }>;
    constructor({ hostname, port, user, https, rateLimit, enabledRoutes, disableLogging, config, corsOptions }: {
        hostname?: string;
        port?: number;
        https?: boolean;
        user: User & {
            sdkConfig?: FilenSDKConfig;
        };
        rateLimit?: RateLimit;
        disableLogging?: boolean;
        config?: Partial<F3PublicServerConfig>;
        corsOptions?: any;
        enabledRoutes?: Record<string, unknown>;
    });
    private get isLoggedIn();
    updateCorsCache(bucket: string, origins: string[], now: number, cacheHit: boolean): void;
    private initializeRoutes;
    private startServerAndSocket;
    getObject(key: string): Promise<{
        exists: false;
    } | {
        exists: true;
        stats: FSStats;
    }>;
    start(): Promise<void>;
    stop(terminate?: boolean): Promise<void>;
}
export type Server = F3PublicExpress;
export {};
