/**
 * @swagger
 * components:
 *   schemas:
 *     TopicInstance:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         topic:
 *           type: string
 *           description: ObjectId ref to Topic
 *         subject:
 *           type: string
 *           description: ObjectId ref to Subject
 *         class:
 *           type: string
 *           example: jss2
 *         difficultyLevel:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         order:
 *           type: number
 *         estimatedDuration:
 *           type: number
 *           nullable: true
 *         isCore:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITopicInstance extends Document {
  topic: Types.ObjectId;

  subject: Types.ObjectId;

  class: string; 

  difficultyLevel: "beginner" | "intermediate" | "advanced";

  order: number;

  estimatedDuration?: number;

  isCore: boolean;
}

const TopicInstanceSchema = new Schema<ITopicInstance>(
  {
    topic: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },

    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    class: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    difficultyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },

    estimatedDuration: Number,

    isCore: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicates like "Comprehension in JSS2" appearing twice
TopicInstanceSchema.index({ topic: 1, class: 1 }, { unique: true });

TopicInstanceSchema.index(
  { topic: 1, class: 1, difficultyLevel: 1 },
  { unique: true },
);

TopicInstanceSchema.index({ subject: 1, class: 1 });

// Ordering queries
TopicInstanceSchema.index({ class: 1, order: 1 });

export default mongoose.models.TopicInstance ||
  mongoose.model("TopicInstance", TopicInstanceSchema);
