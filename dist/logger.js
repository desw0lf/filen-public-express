import path from "path";
import { pino } from "pino";
import fs from "fs-extra";
import { createStream } from "rotating-file-stream";
import { isObject } from "./utils/is-type.js";
import {} from "express";
import {} from "./types.js";
export const getRequestLog = (req) => ({
    ip: req.ip || req.headers["x-forwarded-for"] || req.headers["cf-connecting-ip"] || "?",
    path: req.path,
    origin: req.headers["origin"],
    referer: req.headers["referer"],
});
export class Logger {
    logger = null;
    disableLogging;
    loggerReady;
    constructor(options, isWorker = false) {
        this.disableLogging = !options.enableConsole && !options.enableFileLogging;
        this.loggerReady = this.initLogger(isWorker, options);
    }
    async initLogger(isWorker, { logsPath, level, enableConsole, enableFileLogging, ...options }) {
        await fs.ensureDir(logsPath);
        const logFile = path.join(logsPath, isWorker ? "worker.log" : "server.log");
        const streams = [];
        if (enableConsole) {
            streams.push({ stream: process.stdout });
        }
        if (enableFileLogging) {
            const rotatingStream = createStream(path.basename(logFile), {
                path: path.dirname(logFile),
                ...options
            });
            streams.push({ stream: rotatingStream });
        }
        this.logger = pino({ level }, pino.multistream(streams));
    }
    async log(level, msg, where) {
        if (this.disableLogging)
            return;
        await this.loggerReady;
        if (!this.logger)
            return;
        // const message = where ? `[${where}] ` : "";
        const logData = typeof msg === "string" || typeof msg === "number"
            ? { where, msg }
            : isObject(msg)
                ? { where, ...msg }
                : "";
        setImmediate(() => {
            this.logger?.[level]?.(logData);
        });
    }
}
