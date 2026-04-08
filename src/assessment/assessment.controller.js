"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const questions_model_1 = __importDefault(require("./model/questions.model"));
const mongoose_1 = require("mongoose");
const axios_1 = __importDefault(require("axios"));
let AssessmentController = class AssessmentController {
    getAssessment(category) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield questions_model_1.default.find({ category });
                return {
                    statusCode: 200,
                    status: true,
                    message: "Assessments retrieved successfully",
                    data,
                };
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Internal Server Error";
                return {
                    status: false,
                    statusCode: 500,
                    message: message,
                    data: null,
                };
            }
        });
    }
    getQuestions(subject, gradeClass) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield questions_model_1.default.find({ subject, class: gradeClass });
                return {
                    statusCode: 200,
                    status: true,
                    message: "Assessments retrieved successfully",
                    data,
                };
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Internal Server Error";
                return {
                    status: false,
                    statusCode: 500,
                    message: message,
                    data: null,
                };
            }
        });
    }
    createAssessment(createQuestionDto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield questions_model_1.default.insertMany(createQuestionDto);
                return {
                    statusCode: 200,
                    status: true,
                    message: "Assessments submitted successfully",
                };
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Internal Server Error";
                return {
                    status: false,
                    statusCode: 500,
                    message: message,
                    data: null,
                };
            }
        });
    }
    getScore(answers) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!Array.isArray(answers) || answers.length === 0) {
                    return {
                        status: false,
                        statusCode: 400,
                        message: "No answers provided",
                        data: null,
                    };
                }
                const norm = (v) => String(v !== null && v !== void 0 ? v : "")
                    .trim()
                    .toLowerCase();
                // collect valid ObjectIds
                const ids = answers
                    .map((a) => a === null || a === void 0 ? void 0 : a.questionId)
                    .filter((id) => !!id && mongoose_1.Types.ObjectId.isValid(id))
                    .map((id) => new mongoose_1.Types.ObjectId(id));
                // fetch only needed fields; include 'answer' (the dataset’s correct key)
                const questions = yield questions_model_1.default.find({ _id: { $in: ids } })
                    .select("_id subCategory subcategory topic subTopic subject answer correctAnswer correctAnswers")
                    .lean();
                // index by id
                const byId = new Map();
                for (const q of questions) {
                    const subcategory = q.subCategory ||
                        q.subcategory ||
                        q.topic ||
                        q.subTopic ||
                        q.subject ||
                        "Uncategorized";
                    const correctsRaw = Array.isArray(q.correctAnswers)
                        ? q.correctAnswers
                        : q.correctAnswer != null
                            ? [q.correctAnswer]
                            : q.answer != null
                                ? [q.answer]
                                : [];
                    byId.set(String(q._id), {
                        subcategory,
                        corrects: new Set(correctsRaw.map(norm)),
                    });
                }
                const buckets = new Map();
                let totalCorrect = 0;
                let totalQuestions = 0;
                for (const a of answers) {
                    if (!(a === null || a === void 0 ? void 0 : a.questionId) || !mongoose_1.Types.ObjectId.isValid(a.questionId))
                        continue;
                    const q = byId.get(a.questionId);
                    if (!q)
                        continue;
                    const b = (_a = buckets.get(q.subcategory)) !== null && _a !== void 0 ? _a : { correct: 0, total: 0 };
                    b.total += 1;
                    totalQuestions += 1;
                    const submitted = norm(a.answer);
                    if (q.corrects.has(submitted)) {
                        b.correct += 1;
                        totalCorrect += 1;
                    }
                    buckets.set(q.subcategory, b);
                }
                const scores = {};
                const breakdown = {};
                for (const [subcat, { correct, total }] of buckets.entries()) {
                    breakdown[subcat] = { correct, total };
                    scores[subcat] = total ? Math.round((correct / total) * 100) : 0;
                }
                const resp = {
                    scores,
                    breakdown,
                    total: { correct: totalCorrect, total: totalQuestions },
                };
                const mapping = {
                    Reading: {
                        topic_id: "read",
                        name: "Reading",
                        tags: ["english", "read"],
                        prerequisite: null,
                    },
                    Writing: {
                        topic_id: "Writing",
                        name: "Fractions",
                        tags: ["english", "write"],
                        prerequisite: null,
                    },
                    "Listening & Speaking": {
                        topic_id: "list-speak",
                        name: "Listening & Speaking",
                        tags: ["english", "list-speak"],
                        prerequisite: null,
                    },
                };
                const predictBody = this.buildPredictPayload(resp, {
                    student: "student_1",
                    mapping,
                    mastery_threshold: 70,
                    enrich_with_llm: true,
                });
                const data = yield this.callPredict(predictBody);
                return {
                    statusCode: 200,
                    status: true,
                    message: "Scores computed successfully",
                    data,
                };
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Internal Server Error";
                return {
                    status: false,
                    statusCode: 500,
                    message: message,
                    data: null,
                };
            }
        });
    }
    buildPredictPayload(resp, opts) {
        const { student, mapping, mastery_threshold = 70, enrich_with_llm = true, } = opts;
        const outScores = {};
        const topicsById = new Map();
        for (const [subcategory, pct] of Object.entries(resp.scores || {})) {
            const topic = mapping[subcategory];
            if (!topic)
                continue; // skip any subcategory without a mapping
            topicsById.set(topic.topic_id, topic);
            // Use the percentage score (rounded)
            outScores[topic.topic_id] = Math.round(Number(pct));
        }
        return {
            student,
            scores: outScores,
            topics: Array.from(topicsById.values()),
            mastery_threshold,
            enrich_with_llm,
        };
    }
    callPredict(resp) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const client = axios_1.default.create({
                baseURL: process.env.PREDICT_API_URL || "http://127.0.0.1:8001",
                headers: { "Content-Type": "application/json" },
                timeout: 15000,
            });
            try {
                const { data } = yield client.post("/predict", resp);
                return data;
            }
            catch (err) {
                if (axios_1.default.isAxiosError(err)) {
                    const detail = ((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) ||
                        ((_d = (_c = err.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.message) ||
                        err.message;
                    console.error("Predict failed:", detail, (_e = err.response) === null || _e === void 0 ? void 0 : _e.data);
                    throw new Error(detail);
                }
                throw err;
            }
        });
    }
};
__decorate([
    (0, tsoa_1.Get)("/{category}"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssessmentController.prototype, "getAssessment", null);
__decorate([
    (0, tsoa_1.Get)("/{subject}/{gradeClass}"),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AssessmentController.prototype, "getQuestions", null);
__decorate([
    (0, tsoa_1.Post)("/"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AssessmentController.prototype, "createAssessment", null);
__decorate([
    (0, tsoa_1.Post)("/get-score"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AssessmentController.prototype, "getScore", null);
AssessmentController = __decorate([
    (0, tsoa_1.Tags)("Assessment"),
    (0, tsoa_1.Route)("api/v1/assessment")
], AssessmentController);
exports.default = AssessmentController;
//# sourceMappingURL=assessment.controller.js.map