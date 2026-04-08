"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningStyleModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const resultSchema = new mongoose_1.default.Schema({
    student_id: { type: String, required: true },
    learning_style: String,
    confidence: Number,
    style_breakdown: Object,
    recommended_formats: [String],
    explanation: String,
    risk_of_misclassification: String,
}, { timestamps: true });
exports.LearningStyleModel = mongoose_1.default.model("LearningStyle", resultSchema);
//# sourceMappingURL=result.model.js.map