import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAssessmentResult extends Document {
  assessmentId: Types.ObjectId;
  userId: Types.ObjectId;

  score: number;

  weakTopics: Types.ObjectId[]; // TopicInstance IDs
  strongTopics: Types.ObjectId[];

  topicBreakdown: {
    topicInstanceId: Types.ObjectId;
    correct: number;
    total: number;
    score: number; // 0–100
  }[];

  answers: {
    questionId: Types.ObjectId;
    selected: string;
    correct: boolean;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const AssessmentResultSchema = new Schema<IAssessmentResult>(
  {
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // 🔥 MUST reference TopicInstance
    weakTopics: [
      {
        type: Schema.Types.ObjectId,
        ref: "TopicInstance",
      },
    ],

    strongTopics: [
      {
        type: Schema.Types.ObjectId,
        ref: "TopicInstance",
      },
    ],

    // 🔥 CORE ANALYTICS FIELD
    topicBreakdown: [
      {
        topicInstanceId: {
          type: Schema.Types.ObjectId,
          ref: "TopicInstance",
          required: true,
        },
        correct: {
          type: Number,
          required: true,
          min: 0,
        },
        total: {
          type: Number,
          required: true,
          min: 1,
        },
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
      },
    ],

    answers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "AssessmentQuestion",
          required: true,
        },
        selected: {
          type: String,
          required: true,
        },
        correct: {
          type: Boolean,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

// 🔥 Useful indexes
AssessmentResultSchema.index({ userId: 1, createdAt: -1 });
AssessmentResultSchema.index({ assessmentId: 1 });

// optional: faster filtering by topic instance
AssessmentResultSchema.index({ "topicBreakdown.topicInstanceId": 1 });

export default mongoose.model<IAssessmentResult>(
  "AssessmentResult",
  AssessmentResultSchema,
);
