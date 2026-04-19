import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  questionNumber: string;
  question: string;
  options: {
    key: string;
    text: string;
    trait?: "visual" | "auditory" | "reading" | "kinesthetic" | "neutral";
  }[];
  category: "learning_style" | "cognitive";
  answer?: string; // cognitive
}

const QuestionSchema = new Schema<IQuestion>(
  {
    questionNumber: { type: String, required: true, unique: true },
    question: { type: String, required: true },

    options: [
      {
        key: { type: String, required: true },
        text: { type: String, required: true },
        trait: {
          type: String,
          enum: ["visual", "auditory", "reading", "kinesthetic", "neutral"]
        },
      },
    ],

    category: {
      type: String,
      enum: ["learning_style", "cognitive"],
      required: true,
    },

    answer: {
      type: String, 
    },
  },
  { timestamps: true },
);

export default mongoose.model<IQuestion>("Question", QuestionSchema);
