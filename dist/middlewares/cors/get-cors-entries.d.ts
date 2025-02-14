import { type Server } from "../../index.ts";
export interface CorsEntry {
    AllowedMethods: string[];
    AllowedOrigins: string[];
}
export declare function parseOriginList(origin: unknown): string[];
export declare function findCorsEntryByMethod(entries: CorsEntry[], method: string): CorsEntry;
export declare function readAndParseCorsEntries(sdk: Server["sdk"], path: string): Promise<CorsEntry[]>;
