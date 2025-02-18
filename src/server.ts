import express, { type Request, type Response, type Express, type NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { FilenSDK, type SocketEvent, type FSStats } from "@filen/sdk";
import http, { type IncomingMessage, type ServerResponse } from "http";
import { getRequestLog, Logger } from "./logger.ts";
// import HeadObject from "./handlers/headObject.ts";
import GetObject from "./handlers/getObject.ts";
import { normalizeKey } from "@filen/s3/dist/utils.js";
import { createCorsMiddleware } from "./middlewares/cors/index.ts";
import { contentDispositionMiddleware } from "./middlewares/content-disposition.ts";
import { errors } from "./middlewares/errors.ts";
import { createError } from "./utils/error.ts";
import middlewareBody from "@filen/s3/dist/middlewares/body.js";
import { defaultPort, defaultCorsOptions, defaultConfig, defaultLoggerOptions } from "./consts.ts";
import { getIp } from "./utils/get-ip.ts";
// ? TYPES:
import type { ServerConfig, RateLimit } from "@filen/s3";
import { type Socket } from "net";
import { type Duplex } from "stream";
import type { FilenPublicServerConfig, User, FilenSDKConfig, CorsEntry, LoggerOptions } from "./types.ts";

const body = (middlewareBody as any).default as typeof middlewareBody;

export class FilenPublicExpress {
  public readonly server: Express;
  public readonly serverConfig: ServerConfig;
  public readonly user: User;
  public readonly sdk: FilenSDK;
  public serverInstance: http.Server<typeof IncomingMessage, typeof ServerResponse> = null as any;
  public connections: Record<string, Socket | Duplex> = {};
  public rateLimit: RateLimit;
  public logger: Logger;
  public config: FilenPublicServerConfig;
  public corsBucketCache = new Map<string, { entries: CorsEntry[]; expiresAt: number }>();

  public constructor({
    hostname = "0.0.0.0",
    port = defaultPort as number,
    user,
    https = false,
    rateLimit = {
      windowMs: 1000,
      limit: 1000,
      key: "accessKeyId" // not used
    },
    enabledRoutes = {
      GetObject: true,
      // HeadObject: true
    },
    logger: { instance, ...customLoggerOptions } = {},
    config = {},
    corsOptions = defaultCorsOptions
  }: {
    hostname?: string
    port?: number
    https?: boolean
    user: User & { sdkConfig?: FilenSDKConfig }
    rateLimit?: RateLimit
    logger?: Partial<LoggerOptions> & { instance?: typeof Logger }
    config?: Partial<FilenPublicServerConfig>
    corsOptions?: any;
    enabledRoutes?: Record<string, unknown>
  }) {
    this.serverConfig = { hostname, port, https };
    this.rateLimit = rateLimit;
    const loggerOptions = { ...defaultLoggerOptions, ...customLoggerOptions };
    this.logger = instance ? new instance(loggerOptions) : { log: () => {} } as unknown as Logger;
    this.config = { ...defaultConfig, ...config };
    this.updateCorsCache = this.updateCorsCache.bind(this);

		if (user.sdk) {
			this.sdk = user.sdk;
			this.user = {
				...user,
				sdkConfig: user.sdk.config,
				sdk: this.sdk
			};
		} else if (user.sdkConfig) {
			this.sdk = new FilenSDK({
				...user.sdkConfig,
        tmpPath: path.join(os.tmpdir(), "filen-sdk"),
				connectToSocket: true,
				metadataCache: true
			});
			this.user = {
				...user,
				sdkConfig: user.sdkConfig,
				sdk: this.sdk
			};
    } else {
			throw new Error("Either pass a configured SDK instance OR a SDKConfig object to the user object.")
		}
    this.server = express();
    this.server.set("trust proxy", config.expressTrustProxy);


    this.sdk.socket.on("socketEvent", (event: SocketEvent) => {
      if (event.type === "passwordChanged") {
        this.user.sdk = undefined;
        this.user.sdkConfig = undefined;

        this.stop(true).catch(() => {});
      }
    });

    const disableLogging = (!loggerOptions.enableConsole && !loggerOptions.enableFileLogging) || typeof instance  === "undefined";;

    this.initializeRoutes(enabledRoutes, corsOptions, disableLogging);
  }

  private get isLoggedIn(): boolean {
    return (this.sdk as any).isLoggedIn();
  }

  public updateCorsCache(bucket: string, entries: CorsEntry[], now: number, cacheHit: boolean): void {
    if (this.config.corsBucketCacheTTLMinutes <= 0 || cacheHit) {
      return;
    }
    this.corsBucketCache.set(bucket, { entries, expiresAt: now + this.config.corsBucketCacheTTLMinutes * 60000 });
  }

  private purgeCorsCache(): number {
    const size = this.corsBucketCache.size;
    this.corsBucketCache.clear();
    return size;
  }

  private initializeRoutes(enabled: Record<string, unknown>, corsOptions: any, disableLogging: boolean): void {
    this.connections = {};

		this.server.disable("x-powered-by");
    if (!disableLogging) {
      this.server.use(async (req: Request, _res: Response, next: NextFunction) => {
        await this.logger.log("info", { msg: "", req: getRequestLog(req) });
        next();
      });
    }
    this.server.use(createCorsMiddleware(this, corsOptions));
		this.server.use(rateLimit({
      windowMs: this.rateLimit.windowMs,
      limit: this.rateLimit.limit,
      standardHeaders: "draft-7",
      legacyHeaders: true,
      keyGenerator: (req) => getIp(req)
		}));
    this.server.use(body as any);
    // enabled.HeadObject && this.server.head("/:bucket/:key*", new HeadObject(this).handle);
    if (enabled.GetObject) {
      this.server.get(this.config.masterBucket ? "/:key*" : "/:bucket/:key*", new GetObject(this).handle, contentDispositionMiddleware(this.config.downloadFileParam));
    }
    this.server.get("/health", (_req: Request, res: Response) => {
      res.send("OK");
    });
    if (this.config.corsBucketCachePurgeUrl && this.config.corsBucketCachePurgeUrl.startsWith("/")) {
      this.server.get(this.config.corsBucketCachePurgeUrl, (_req: Request, res: Response) => {
        res.send(this.purgeCorsCache());
      });
    }
    this.server.use((_req: Request, _res: Response) => {
      throw createError(404, "NoSuchKey", "The specified key does not exist.");
		});
    this.server.use(errors(this.logger));
  }

  private async startServerAndSocket(): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
      const protocol = this.serverConfig.https ? "https" : "http";
      if (this.serverConfig.https) {
        reject("unsupported");
      }
      this.serverInstance = http.createServer(this.server)
        .listen(this.serverConfig.port, this.serverConfig.hostname, () => {
          this.serverInstance.setTimeout(86400000 * 7);
          this.serverInstance.timeout = 86400000 * 7;
          this.serverInstance.keepAliveTimeout = 86400000 * 7;
          this.serverInstance.headersTimeout = 86400000 * 7 * 2;
          this.logger.log("info", `Filen Public Express Server started on ${protocol}://${this.serverConfig.hostname}:${this.serverConfig.port}`);
          resolve();
        })
        .on("connection", (socket) => {
          const socketId = uuidv4();
          // console.log(`New connection: ${socketId}`);
          this.connections[socketId] = socket;
          socket.once("close", () => {
            delete this.connections[socketId];
          })
        });
    });
  }

  public async getObject(key: string): Promise<{ exists: false } | { exists: true; stats: FSStats }> {
    try {
      const stats = await this.sdk.fs().stat({ path: normalizeKey(key) });
      return { exists: true, stats };
    } catch {
      return { exists: false };
    }
  }

  public async start(): Promise<void> {
    if (!this.isLoggedIn) {
      const { email, password, twoFactorCode } = this.user.sdkConfig || {};
      if (email && password) {
        await this.sdk.login({ email, password, twoFactorCode });
      }
    }
    if (!this.isLoggedIn) {
      throw new Error("Not logged in");
    }
    await this.startServerAndSocket();
  }

  public async stop(terminate: boolean = false): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      if (!this.serverInstance) {
        resolve();
        return;
      };

      this.serverInstance.close(err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });

      if (terminate) {
        for (const socketId in this.connections) {
          try {
            this.connections[socketId]?.destroy();
            delete this.connections[socketId];
          } catch {
            // Noop
          }
        }
      }
    });
  }
}

export type Server = FilenPublicExpress;