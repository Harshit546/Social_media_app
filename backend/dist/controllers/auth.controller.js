"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const auth_schema_1 = require("../validations/auth.schema");
const authService = __importStar(require("../services/auth.service"));
const validator_1 = require("../utils/validator");
const errors_1 = require("../utils/errors");
const register = async (req, res, next) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new errors_1.BadRequestError("Request body cannot be empty");
        }
        (0, validator_1.validateOrThrow)(req.body, auth_schema_1.registerRules, auth_schema_1.registerMessages);
        const result = await authService.registerUser(req.body.email, req.body.password);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: { user: result.user, token: result.token }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new errors_1.BadRequestError("Request body cannot be empty");
        }
        (0, validator_1.validateOrThrow)(req.body, auth_schema_1.loginRules, auth_schema_1.loginMessages);
        const result = await authService.loginUser(req.body.email, req.body.password);
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: { user: result.user, token: result.token }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
