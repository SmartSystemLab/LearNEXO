import mongoose, { Schema, Document } from "mongoose";

export interface IAssessmentQuestion extends Document {
  questionNumber: string;
  subject: string; // e.g. English
  class: string; // e.g. JSS2
  topic: string; // e.g. Grammar, Comprehension

  question: string;

  options: {
    key: string;
    text: string;
  }[];

  answer: string;

  difficulty: "easy" | "medium" | "hard";

  category: "grammar" | "comprehension" | "vocabulary" | "oral" | "writing";

  explanation?: string;
}

const AssessmentQuestionSchema = new Schema<IAssessmentQuestion>(
  {
    questionNumber: { type: String, required: true, unique: true },

    subject: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    class: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    topic: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    question: { type: String, required: true },

    options: [
      {
        key: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],

    answer: { type: String, required: true },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    category: {
      type: String,
      enum: ["grammar", "comprehension", "vocabulary", "oral", "writing"],
      required: true,
    },

    explanation: {
      type: String,
    },
  },
  { timestamps: true },
);

AssessmentQuestionSchema.index({ subject: 1, class: 1 });
AssessmentQuestionSchema.index({ subject: 1, class: 1, topic: 1 });

export default mongoose.model<IAssessmentQuestion>(
  "AssessmentQuestion",
  AssessmentQuestionSchema,
);
