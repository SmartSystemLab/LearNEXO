import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAssessmentQuestion extends Document {
  questionNumber: string;
  subject: Types.ObjectId; // e.g. English
  class: string; // e.g. JSS2

  topicInstanceId: Types.ObjectId; // e.g. Grammar, Comprehension

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
      type: Schema.Types.ObjectId,
      ref: "Subject",
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

    topicInstanceId: {
      type: Schema.Types.ObjectId,
      ref: "TopicInstance",
      required: true,
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
AssessmentQuestionSchema.index({ subject: 1, class: 1, topicInstanceId: 1 });
export default mongoose.model<IAssessmentQuestion>(
  "AssessmentQuestion",
  AssessmentQuestionSchema,
);
