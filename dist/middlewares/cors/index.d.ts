import { type Server } from "../../server.ts";
import { type CorsOptions } from "../../types.ts";
export declare const createCorsMiddleware: (server: Server, defaultOptions: CorsOptions) => any;
