import {} from "express";
export const getIp = (req, headerOrIp) => {
    if (headerOrIp === "ip")
        return req.ip;
    if (typeof headerOrIp === "string")
        return req.headers[headerOrIp];
    return req.headers["cf-connecting-ip"] || req.ip || req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
};
