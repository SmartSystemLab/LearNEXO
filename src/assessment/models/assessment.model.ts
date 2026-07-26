/**
 * @swagger
 * components:
 *   schemas:
 *     Assessment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *           description: ObjectId ref to User
 *         subject:
 *           type: string
 *           description: ObjectId ref to Subject
 *         class:
 *           type: string
 *           example: jss2
 *         type:
 *           type: string
 *           enum: [initial, general, category, topic]
 *         topicInstances:
 *           type: array
 *           items:
 *             type: string
 *           description: ObjectId[] ref to TopicInstance
 *         questions:
 *           type: array
 *           items:
 *             type: string
 *           description: ObjectId[] ref to AssessmentQuestion
 *         totalQuestions:
 *           type: number
 *           minimum: 1
 *         status:
 *           type: string
 *           enum: [in-progress, completed, abandoned]
 *           default: in-progress
 *         startedAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         duration:
 *           type: number
 *           nullable: true
 *           description: Seconds elapsed
 *         score:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           nullable: true
 *         submittedAnswers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *               selected:
 *                 type: string
 *               isCorrect:
 *                 type: boolean
 *                 nullable: true
 *         result:
 *           type: object
 *           properties:
 *             attempted:
 *               type: number
 *             correct:
 *               type: number
 *             wrong:
 *               type: number
 *             unanswered:
 *               type: number
 *             topicPerformance:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   topicInstanceId:
 *                     type: string
 *                   accuracy:
 *                     type: number
 *                   total:
 *                     type: number
 *                   correct:
 *                     type: number
 *                   wrong:
 *                     type: number
 *             weakTopics:
 *               type: array
 *               items:
 *                 type: string
 *             strongTopics:
 *               type: array
 *               items:
 *                 type: string
 *         aiContent:
 *           type: array
 *           items:
 *             type: object
 *           nullable: true
 *         meta:
 *           type: object
 *           properties:
 *             source:
 *               type: string
 *               enum: [system, user, recommendation]
 *               default: system
 *             difficultyMix:
 *               type: object
 *               properties:
 *                 easy:
 *                   type: number
 *                   minimum: 0
 *                   default: 0
 *                 medium:
 *                   type: number
 *                   minimum: 0
 *                   default: 0
 *                 hard:
 *                   type: number
 *                   minimum: 0
 *                   default: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
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

  aiContent?: any[] | null;

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
      enum: ["initial", "general", "category", "topic"],
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
    aiContent: [
      {
        type: Schema.Types.Mixed,
      },
    ],
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