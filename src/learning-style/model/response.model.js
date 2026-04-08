"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningResponseModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const responseSchema = new mongoose_1.default.Schema({
    student_id: { type: String, required: true },
    questionnaire: { type: Array, required: true },
    student_activity: [{ type: String }],
    student_profile: { type: Object },
}, { timestamps: true });
exports.LearningResponseModel = mongoose_1.default.model("LearningResponse", responseSchema);
//# sourceMappingURL=response.model.js.map