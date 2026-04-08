import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true },
    learning_style: String,
    confidence: Number,
    style_breakdown: Object,
    recommended_formats: [String],
    explanation: String,
    risk_of_misclassification: String,
  },
  { timestamps: true },
);

export const LearningStyleModel = mongoose.model("LearningStyle", resultSchema);
