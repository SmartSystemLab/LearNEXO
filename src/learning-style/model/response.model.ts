import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true },
    questionnaire: { type: Array, required: true },
    student_activity: [{ type: String }],
    student_profile: { type: Object },
  },
  { timestamps: true },
);

export const LearningResponseModel = mongoose.model(
  "LearningResponse",
  responseSchema,
);
