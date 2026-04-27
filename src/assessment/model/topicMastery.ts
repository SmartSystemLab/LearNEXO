import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITopicMastery extends Document {
  userId: Types.ObjectId;

  topicInstanceId: Types.ObjectId;

  masteryLevel: number; // 0–100

  lastUpdated: Date;

  attempts: number; // optional but VERY useful

  lastScore?: number; // optional (latest performance snapshot)
}

const TopicMasterySchema = new Schema<ITopicMastery>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔥 CORE LINK — DO NOT USE topicId
    topicInstanceId: {
      type: Schema.Types.ObjectId,
      ref: "TopicInstance",
      required: true,
    },

    masteryLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    lastScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// 🔥 CRITICAL: One mastery per user per topic instance
TopicMasterySchema.index({ userId: 1, topicInstanceId: 1 }, { unique: true });

// Useful for fetching progress per user
TopicMasterySchema.index({ userId: 1, lastUpdated: -1 });

export default mongoose.model<ITopicMastery>(
  "TopicMastery",
  TopicMasterySchema,
);
