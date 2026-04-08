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
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitLearningStyle = exports.getLearningStyleQuestions = void 0;
const question_model_1 = require("./model/question.model");
const response_model_1 = require("./model/response.model");
const result_model_1 = require("./model/result.model");
const getLearningStyleQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const questions = yield question_model_1.QuestionModel.find();
    res.json({
        message: "Questions fetched successfully",
        data: questions,
    });
});
exports.getLearningStyleQuestions = getLearningStyleQuestions;
const submitLearningStyle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { student_id, questionnaire, student_activity, student_profile } = req.body;
    try {
        // 1. Save raw response
        yield response_model_1.LearningResponseModel.create({
            student_id,
            questionnaire,
            student_activity,
            student_profile,
        });
        // 2. Call AI (FastAPI) using fetch
        const response = yield fetch("https://learnexo-ai.onrender.com/learning-style/evaluate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                student_profile,
                questionnaire,
                student_activity,
            }),
        });
        // 3. Handle bad response (because fetch won’t do it for you like a nanny)
        if (!response.ok) {
            throw new Error(`AI service error: ${response.status}`);
        }
        const result = yield response.json();
        // 4. Save AI result
        yield result_model_1.LearningStyleModel.create(Object.assign({ student_id }, result));
        // 5. Return response
        res.json({
            message: "Learning style evaluated",
            data: result,
        });
    }
    catch (error) {
        console.error("Learning style error:", error.message);
        res.status(500).json({
            message: "Failed to evaluate learning style",
            error: error.message,
        });
    }
});
exports.submitLearningStyle = submitLearningStyle;
//# sourceMappingURL=learning-style.controller.js.map