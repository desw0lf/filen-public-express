import {} from "express";
import { Responses } from "@filen/s3/dist/responses.js";
import { getRequestLog } from "../logger.js";
export const errors = (logger) => async (err, req, res, _next) => {
    if (!err) {
        return;
    }
    const statusCode = err.statusCode || 500;
    // Log error details
    await logger.log("error", {
        msg: err.message,
        req: getRequestLog(req),
        err: {
            ...err,
            statusCode
        }
    }, "Errors");
    // res.sendStatus(statusCode);
    await Responses.error(res, statusCode, err.message, err.description);
};
