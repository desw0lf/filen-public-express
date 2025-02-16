import { type Request, type Response, type NextFunction } from "express";
import { GetObject } from "@filen/s3/dist/handlers/getObject.js";
import { type Server } from "../index.ts";
export declare class EnhancedGetObject extends GetObject {
    constructor(server: Server);
    private isFileIgnored;
    handle(req: Request, res: Response, next: NextFunction): Promise<any>;
}
export default EnhancedGetObject;
