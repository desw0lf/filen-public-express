import { type Server } from "../../server.ts";
import { type CorsEntry } from "../../types.ts";
export declare function parseOriginList(origin: unknown): string[];
export declare function findCorsEntryByMethod(entries: CorsEntry[], method: string): CorsEntry;
export declare function readAndParseCorsEntries(sdk: Server["sdk"], path: string): Promise<CorsEntry[]>;
