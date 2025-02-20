import path from "path";
import { pino, type Logger as PinoLogger } from "pino";
import fs from "fs-extra";
import { createStream } from "rotating-file-stream";
import { isObject } from "./utils/is-type.ts";
import { getIp } from "./utils/get-ip.ts";
import { type Request } from "express";
import { type LogLevel, type LoggerOptions, type PartialBy } from "./types.ts";

export const getRequestLog = (req: Request) => ({
  ip: getIp(req) || "?",
  path: req.path,
  origin: req.headers["origin"],
  referer: req.headers["referer"],
  userAgent: req.headers["user-agent"],
});

export class Logger {
  private logger: PinoLogger | null = null;
  private readonly disableLogging: boolean;
  private loggerReady: Promise<void>;

  public constructor(options: LoggerOptions, isWorker = false) {
    this.disableLogging = !options.enableConsole && !options.enableFileLogging;

    this.loggerReady = this.initLogger(isWorker, options);
  }

  private async initLogger(isWorker: boolean, { logsPath, level, enableConsole, enableFileLogging, ...options }: LoggerOptions): Promise<void> {
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

  public async log(level: LogLevel, msg?: unknown, where?: string): Promise<void> {
    if (this.disableLogging) return;

    await this.loggerReady;

    if (!this.logger) return;

    // const message = where ? `[${where}] ` : "";
    const logData =
      typeof msg === "string" || typeof msg === "number"
        ? { where, msg }
          : isObject(msg)
          ? { where, ...msg }
        : "";

    setImmediate(() => {
      this.logger?.[level]?.(logData);
    });
  }
}
export type LoggerConstructor = new (options: LoggerOptions) => Logger;
export type LoggerInstance = Logger | Pick<Logger, "log">;

export type LoggerWithInstance = Partial<LoggerOptions> & {
  instance?: LoggerConstructor | LoggerInstance;
};