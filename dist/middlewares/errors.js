import {} from "express";
import { Responses } from "@filen/s3/dist/responses.js";
export const errors = async (err, req, res, _next) => {
    if (!err) {
        return;
    }
    const origin = req.headers["origin"] || req.headers["referer"] || "?";
    console.error(`[ERROR] ${err.message} <IP: ${req.ip}> <Origin/Referer: ${origin}> <Path: ${req.path}>`);
    const statusCode = err.statusCode || 500;
    // res.sendStatus(statusCode);
    await Responses.error(res, statusCode, err.message, err.description);
};
