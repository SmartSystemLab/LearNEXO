import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITopicInstance extends Document {
  topic: Types.ObjectId;

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

// Ordering queries
TopicInstanceSchema.index({ class: 1, order: 1 });

export default mongoose.model<ITopicInstance>(
  "TopicInstance",
  TopicInstanceSchema,
);
