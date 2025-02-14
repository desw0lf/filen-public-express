import express, {} from "express";
import { rateLimit } from "express-rate-limit";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { FilenSDK } from "@filen/sdk";
import http, {} from "http";
import { Logger } from "@filen/s3/dist/logger.js";
// import HeadObject from "./handlers/headObject.ts";
import GetObject from "./handlers/getObject.js";
import { normalizeKey } from "@filen/s3/dist/utils.js";
import { createCorsMiddleware } from "./middlewares/cors.js";
import { errors } from "./middlewares/errors.js";
import middlewareBody from "@filen/s3/dist/middlewares/body.js";
import {} from "net";
import {} from "stream";
const body = middlewareBody.default;
const defaultPort = process.env.PORT || 1700;
const defaultCorsOptions = {
    origin: "*",
    methods: "GET",
};
const defaultConfig = {
    corsBucketFileName: ".f3-public.json",
    corsBucketCacheTTLMinutes: 5,
};
export class F3PublicExpress {
    server;
    serverConfig;
    user;
    sdk;
    serverInstance = null;
    connections = {};
    rateLimit;
    logger;
    config;
    corsBucketCache = new Map();
    constructor({ hostname = "0.0.0.0", port = defaultPort, user, https = false, rateLimit = {
        windowMs: 1000,
        limit: 1000,
        key: "accessKeyId" // not used
    }, enabledRoutes = {
        GetObject: true,
        // HeadObject: true
    }, disableLogging = false, config = {}, corsOptions = defaultCorsOptions }) {
        this.serverConfig = { hostname, port, https };
        this.rateLimit = rateLimit;
        this.logger = new Logger(disableLogging, false);
        this.config = { ...defaultConfig, ...config };
        this.updateCorsCache = this.updateCorsCache.bind(this);
        if (user.sdk) {
            this.sdk = user.sdk;
            this.user = {
                ...user,
                sdkConfig: user.sdk.config,
                sdk: this.sdk
            };
        }
        else if (user.sdkConfig) {
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
        }
        else {
            throw new Error("Either pass a configured SDK instance OR a SDKConfig object to the user object.");
        }
        this.server = express();
        this.sdk.socket.on("socketEvent", (event) => {
            if (event.type === "passwordChanged") {
                this.user.sdk = undefined;
                this.user.sdkConfig = undefined;
                this.stop(true).catch(() => { });
            }
        });
        this.initializeRoutes(enabledRoutes, corsOptions);
    }
    get isLoggedIn() {
        return this.sdk.isLoggedIn();
    }
    updateCorsCache(bucket, origins, now, cacheHit) {
        if (this.config.corsBucketCacheTTLMinutes <= 0 || cacheHit) {
            return;
        }
        this.corsBucketCache.set(bucket, { origins, expiresAt: now + this.config.corsBucketCacheTTLMinutes * 60000 });
    }
    initializeRoutes(enabled, corsOptions) {
        this.connections = {};
        this.server.disable("x-powered-by");
        this.server.use(createCorsMiddleware(this, corsOptions));
        this.server.use(rateLimit({
            windowMs: this.rateLimit.windowMs,
            limit: this.rateLimit.limit,
            standardHeaders: "draft-7",
            legacyHeaders: true
        }));
        this.server.use(body);
        // enabled.HeadObject && this.server.head("/:bucket/:key*", new HeadObject(this).handle);
        enabled.GetObject && this.server.get(this.config.masterBucket ? "/:key*" : "/:bucket/:key*", new GetObject(this).handle);
        this.server.get("/health", (_req, res) => {
            res.send("OK");
        });
        this.server.use(errors);
    }
    async startServerAndSocket() {
        return await new Promise((resolve, reject) => {
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
                console.log(`F3 Public Server started on ${protocol}://${this.serverConfig.hostname}:${this.serverConfig.port}`);
                resolve();
            })
                .on("connection", (socket) => {
                const socketId = uuidv4();
                // console.log(`New connection: ${socketId}`);
                this.connections[socketId] = socket;
                socket.once("close", () => {
                    delete this.connections[socketId];
                });
            });
        });
    }
    async getObject(key) {
        try {
            const stats = await this.sdk.fs().stat({ path: normalizeKey(key) });
            return { exists: true, stats };
        }
        catch {
            return { exists: false };
        }
    }
    async start() {
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
    async stop(terminate = false) {
        await new Promise((resolve, reject) => {
            if (!this.serverInstance) {
                resolve();
                return;
            }
            ;
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
                    }
                    catch {
                        // Noop
                    }
                }
            }
        });
    }
}
