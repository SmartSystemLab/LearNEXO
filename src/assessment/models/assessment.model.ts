import mongoose, { Document, Types, Schema } from "mongoose";

interface IAssessment extends Document {
  userId: Types.ObjectId;

  subject: Types.ObjectId;
  class: string;

  type: "initial" | "general" | "topic";

  topicInstances: Types.ObjectId[];

  questions: Types.ObjectId[];

  totalQuestions: number;

  status: "in-progress" | "completed" | "abandoned";

  startedAt: Date;
  completedAt?: Date;

  duration?: number;

  score?: number;

  submittedAnswers?: {
    questionId: Types.ObjectId;
    selected: string;
    isCorrect?: boolean;
  }[];

  result?: {
    attempted: number;
    correct: number;
    wrong: number;
    unanswered: number;

    topicPerformance: {
      topicInstanceId: Types.ObjectId;

      accuracy: number;

      total: number;
      correct: number;
      wrong: number;
    }[];

    weakTopics: Types.ObjectId[];

    strongTopics: Types.ObjectId[];
  };

  meta?: {
    source: "system" | "user" | "recommendation";

    difficultyMix?: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
}


const AssessmentSchema = new Schema<IAssessment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    class: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["initial", "general", "topic"],
      required: true,
      index: true,
    },

    topicInstances: [
      {
        type: Schema.Types.ObjectId,
        ref: "TopicInstance",
        required: true,
      },
    ],

    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "AssessmentQuestion",
        required: true,
      },
    ],

    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress",
      index: true,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
    },

    duration: {
      type: Number, // seconds
      min: 0,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },

    submittedAnswers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "AssessmentQuestion",
        },

        selected: String,

        isCorrect: Boolean,
      },
    ],

    result: {
      attempted: Number,

      correct: Number,

      wrong: Number,

      unanswered: Number,

      topicPerformance: [
        {
          topicInstanceId: {
            type: Schema.Types.ObjectId,
            ref: "TopicInstance",
          },

          accuracy: Number,

          total: Number,

          correct: Number,

          wrong: Number,
        },
      ],

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
    },
    meta: {
      source: {
        type: String,
        enum: ["system", "user", "recommendation"],
        default: "system",
      },

      difficultyMix: {
        easy: { type: Number, min: 0, default: 0 },
        medium: { type: Number, min: 0, default: 0 },
        hard: { type: Number, min: 0, default: 0 },
      },
    },
  },
  {
    timestamps: true,
  },
);
export default mongoose.model<IAssessment>(
  "Assessment",
  AssessmentSchema,
);