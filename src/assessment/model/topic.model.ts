import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITopic extends Document {
  name: string; 
  subject: Types.ObjectId;

  slug: string;

  description?: string;
}

const TopicSchema = new Schema<ITopic>(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    description: String,
  },
  { timestamps: true },
);

TopicSchema.index({ subject: 1, name: 1 });

export default mongoose.model<ITopic>("Topic", TopicSchema);
