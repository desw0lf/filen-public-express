import { type Response, type Request, type NextFunction } from "express";
export declare const contentDispositionMiddleware: (downloadFileParam: string | undefined) => (req: Request, res: Response, _next: NextFunction) => void;
