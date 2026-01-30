"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const errors_1 = require("../utils/errors");
const jwt_1 = require("../utils/jwt");
const authMiddleware = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new errors_1.UnauthorizedError("Missing or invalid authorization header");
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            throw new errors_1.UnauthorizedError("Token not provided");
        }
        const payload = (0, jwt_1.verifyJwt)(token);
        if (!payload.id) {
            throw new errors_1.UnauthorizedError("Invalid token payload");
        }
        req.user = payload;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
