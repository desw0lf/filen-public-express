import { type Express } from "express";
import { FilenSDK, type FSStats } from "@filen/sdk";
import http, { type IncomingMessage, type ServerResponse } from "http";
import { Logger } from "./logger.ts";
import type { ServerConfig, RateLimit } from "@filen/s3";
import { type Socket } from "net";
import { type Duplex } from "stream";
import type { FilenPublicServerConfig, User, FilenSDKConfig, CorsEntry, LoggerOptions } from "./types.ts";
export declare class FilenPublicExpress {
    readonly server: Express;
    readonly serverConfig: ServerConfig;
    readonly user: User;
    readonly sdk: FilenSDK;
    serverInstance: http.Server<typeof IncomingMessage, typeof ServerResponse>;
    connections: Record<string, Socket | Duplex>;
    rateLimit: RateLimit;
    logger: Logger;
    config: FilenPublicServerConfig;
    corsBucketCache: Map<string, {
        entries: CorsEntry[];
        expiresAt: number;
    }>;
    constructor({ hostname, port, user, https, rateLimit, enabledRoutes, logger: { instance, ...customLoggerOptions }, config, corsOptions }: {
        hostname?: string;
        port?: number;
        https?: boolean;
        user: User & {
            sdkConfig?: FilenSDKConfig;
        };
        rateLimit?: RateLimit;
        logger?: Partial<LoggerOptions> & {
            instance?: typeof Logger;
        };
        config?: Partial<FilenPublicServerConfig>;
        corsOptions?: any;
        enabledRoutes?: Record<string, unknown>;
    });
    private get isLoggedIn();
    updateCorsCache(bucket: string, entries: CorsEntry[], now: number, cacheHit: boolean): void;
    private purgeCorsCache;
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
export type Server = FilenPublicExpress;
