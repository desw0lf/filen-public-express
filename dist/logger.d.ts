import { type Request } from "express";
import { type LogLevel, type LoggerOptions } from "./types.ts";
export declare const getRequestLog: (req: Request) => {
    ip: string;
    path: string;
    origin: string;
    referer: string;
};
export declare class Logger {
    private logger;
    private readonly disableLogging;
    private loggerReady;
    constructor(options: LoggerOptions, isWorker?: boolean);
    private initLogger;
    log(level: LogLevel, msg?: unknown, where?: string): Promise<void>;
}
