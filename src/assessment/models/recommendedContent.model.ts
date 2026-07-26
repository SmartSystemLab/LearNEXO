/**
 * @swagger
 * components:
 *   schemas:
 *     RecommendedContent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         assessmentId:
 *           type: string
 *         subject:
 *           type: string
 *         topic:
 *           type: string
 *         category:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         type:
 *           type: string
 *           enum: [video, audio, text, interactive]
 *         url:
 *           type: string
 *           nullable: true
 *         coverImage:
 *           type: string
 *           nullable: true
 *         source:
 *           type: string
 *           enum: [ai, manual]
 *           default: ai
 *         priority:
 *           type: number
 *           default: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
import mongoose, { Document, Types, Schema } from "mongoose";

export interface IRecommendedContent extends Document {
  userId: Types.ObjectId;
  assessmentId: Types.ObjectId;
  subject: Types.ObjectId;
  topic: string;
  category: string;
  title: string;
  description?: string;
  type: "video" | "audio" | "text" | "interactive";
  url?: string;
  coverImage?: string;
  source: "ai" | "manual";
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendedContentSchema = new Schema<IRecommendedContent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["video", "audio", "text", "interactive"],
      required: true,
    },
    url: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    source: {
      type: String,
      enum: ["ai", "manual"],
      default: "ai",
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

RecommendedContentSchema.index({ userId: 1, subject: 1, createdAt: -1 });
RecommendedContentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IRecommendedContent>("RecommendedContent", RecommendedContentSchema);
