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
const assessment_controller_1 = __importDefault(require("./assessment.controller"));
const validation_schema_1 = require("./types/validation.schema");
const validation_1 = require("../middleware/validation");
const assessmentRoute = express_1.default.Router();
assessmentRoute.post("/", (0, validation_1.validateRequest)(validation_schema_1.createQuestionValidation), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessmentService = new assessment_controller_1.default();
    const data = yield assessmentService.createAssessment(req.body);
    const { statusCode } = data, responseData = __rest(data, ["statusCode"]);
    res.status(statusCode).send(Object.assign({}, responseData));
}));
assessmentRoute.get("/:category", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessmentService = new assessment_controller_1.default();
    const data = yield assessmentService.getAssessment(req.params.category);
    const { statusCode } = data, responseData = __rest(data, ["statusCode"]);
    res.status(statusCode).send(Object.assign({}, responseData));
}));
assessmentRoute.get("/:subject/:gradeClass", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessmentService = new assessment_controller_1.default();
    const data = yield assessmentService.getQuestions(req.params.subject, req.params.gradeClass);
    const { statusCode } = data, responseData = __rest(data, ["statusCode"]);
    res.status(statusCode).send(Object.assign({}, responseData));
}));
assessmentRoute.post("/get-score", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const assessmentService = new assessment_controller_1.default();
    const data = yield assessmentService.getScore(req.body);
    const { statusCode } = data, responseData = __rest(data, ["statusCode"]);
    res.status(statusCode).send(Object.assign({}, responseData));
}));
exports.default = assessmentRoute;
//# sourceMappingURL=assessment.routes.js.map