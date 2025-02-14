import {} from "express";
export const errors = (err, _req, res, _next) => {
    console.error(`[ERROR] ${err.message}`);
    const statusCode = err.statusCode || 500;
    res.sendStatus(statusCode);
};
