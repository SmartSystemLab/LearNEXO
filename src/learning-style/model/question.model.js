"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const questionSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true },
    type: { type: String, enum: ["mcq", "german"], required: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    category: { type: String },
});
exports.QuestionModel = mongoose_1.default.model("LearningQuestion", questionSchema);
//# sourceMappingURL=question.model.js.map