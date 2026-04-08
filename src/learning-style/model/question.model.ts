import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ["mcq", "german"], required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  category: { type: String },
});

export const QuestionModel = mongoose.model("LearningQuestion", questionSchema);
