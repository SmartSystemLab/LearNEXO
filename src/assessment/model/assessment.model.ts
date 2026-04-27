import { Document, Types } from "mongoose";

export interface IAssessment extends Document {
  userId: Types.ObjectId;

  subject: Types.ObjectId; // 🔥 make it relational
  classLevel: string;

  type: "initial" | "general" | "topic";

  topicInstances: Types.ObjectId[]; // 🔥 consistent with your system

  questions: Types.ObjectId[];

  totalQuestions: number;

  status: "in-progress" | "completed" | "abandoned";

  startedAt: Date;
  completedAt?: Date;

  duration?: number; // seconds (for analytics later)

  meta?: {
    source: "system" | "user" | "recommendation";
    difficultyMix?: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
}
