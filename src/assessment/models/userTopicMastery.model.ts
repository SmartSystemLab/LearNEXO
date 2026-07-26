/**
 * @swagger
 * components:
 *   schemas:
 *     UserTopicMastery:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         topicInstanceId:
 *           type: string
 *         masteryScore:
 *           type: number
 *           default: 50
 *           minimum: 0
 *           maximum: 100
 *         attempts:
 *           type: number
 *           default: 0
 *         lastAccuracy:
 *           type: number
 *           nullable: true
 *         weakStreak:
 *           type: number
 *           default: 0
 *         strongStreak:
 *           type: number
 *           default: 0
 *         status:
 *           type: string
 *           enum: [weak, improving, mastered]
 *           default: improving
 *         lastAssessedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUserTopicMastery extends Document {
  userId: Types.ObjectId;
  topicInstanceId: Types.ObjectId;

  masteryScore: number; // 0-100
  attempts: number;

  lastAccuracy: number;
  weakStreak: number;
  strongStreak: number;

  status: "weak" | "improving" | "mastered";

  lastAssessedAt: Date;
}

const UserTopicMasterySchema = new Schema<IUserTopicMastery>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    topicInstanceId: {
      type: Schema.Types.ObjectId,
      ref: "TopicInstance",
      required: true,
    },

    masteryScore: {
      type: Number,
      default: 50,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    lastAccuracy: Number,

    weakStreak: {
      type: Number,
      default: 0,
    },

    strongStreak: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["weak", "improving", "mastered"],
      default: "improving",
    },

    lastAssessedAt: Date,
  },
  { timestamps: true },
);

UserTopicMasterySchema.index(
  {
    userId: 1,
    topicInstanceId: 1,
  },
  { unique: true },
);

export default mongoose.model("UserTopicMastery", UserTopicMasterySchema);
