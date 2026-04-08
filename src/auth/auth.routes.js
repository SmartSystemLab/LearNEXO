"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("./auth.controller"));
const validation_schema_type_1 = require("./types/validation.schema.type");
const validation_1 = require("../middleware/validation");
const authRoute = express_1.default.Router();
authRoute.post('/sign-in', (0, validation_1.validateRequest)(validation_schema_type_1.createUserValidation), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authService = new auth_controller_1.default();
    const data = yield authService.signUp(req.body);
    const { statusCode } = data, responseData = __rest(data, ["statusCode"]);
    return res.status(statusCode).send(Object.assign({}, responseData));
}));
authRoute.post('/login', (0, validation_1.validateRequest)(validation_schema_type_1.loginUserValidation), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authService = new auth_controller_1.default();
    const data = yield authService.login(req.body);
    const { statusCode } = data, responseData = __rest(data, ["statusCode"]);
    return res.status(statusCode).send(Object.assign({}, responseData));
}));
authRoute.post('/verify', (0, validation_1.validateRequest)(validation_schema_type_1.verifyValidation), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authService = new auth_controller_1.default();
    const data = yield authService.verify(req.body);
    const { statusCode } = data, responseData = __rest(data, ["statusCode"]);
    return res.status(statusCode).send(Object.assign({}, responseData));
}));
authRoute.post('/verify-otp', (0, validation_1.validateRequest)(validation_schema_type_1.verifyValidation), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authService = new auth_controller_1.default();
    const data = yield authService.verifyOtp(req.body);
    const { statusCode } = data, responseData = __rest(data, ["statusCode"]);
    return res.status(statusCode).send(Object.assign({}, responseData));
}));
authRoute.post('/reset-password', (0, validation_1.validateRequest)(validation_schema_type_1.loginUserValidation), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authService = new auth_controller_1.default();
    const data = yield authService.resetPassword(req.body);
    const { statusCode } = data, responseData = __rest(data, ["statusCode"]);
    return res.status(statusCode).send(Object.assign({}, responseData));
}));
authRoute.get('/send-otp/:email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authService = new auth_controller_1.default();
    const data = yield authService.sendOtp(req.params.email);
    const { statusCode } = data, responseData = __rest(data, ["statusCode"]);
    return res.status(statusCode).send(Object.assign({}, responseData));
}));
authRoute.post('/onboarding/:userId', (0, validation_1.validateRequest)(validation_schema_type_1.onboardingValidation), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authService = new auth_controller_1.default();
    const data = yield authService.onboarding(req.body, req.params.userId);
    const { statusCode } = data, responseData = __rest(data, ["statusCode"]);
    return res.status(statusCode).send(Object.assign({}, responseData));
}));
exports.default = authRoute;
//# sourceMappingURL=auth.routes.js.map