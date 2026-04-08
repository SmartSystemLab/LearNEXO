"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.notFound = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const notFound = (req, res, next) => {
    next(new http_errors_1.default.NotFound());
};
exports.notFound = notFound;
const errorResponse = (err, req, res) => {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        stack: err.stack,
        status: false,
    });
};
exports.errorResponse = errorResponse;
//# sourceMappingURL=errorHandler.js.map