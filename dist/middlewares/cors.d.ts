import { type Server } from "../index.ts";
type CorsOptions = Record<string, any>;
export declare const createCorsMiddleware: (server: Server, defaultOptions: CorsOptions) => any;
export {};
