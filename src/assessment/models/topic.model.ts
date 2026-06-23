import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITopic extends Document {
  name: string;
  subject: Types.ObjectId;

  slug: string;

  description?: string;

  // Free-form, per-subject category (e.g. "grammar" for English). Categories
  // are not a global enum - each subject defines its own vocabulary.
  category?: string;
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

    category: {
      type: String,
      trim: true,
      lowercase: true,
      required: false,
    },
  },
  { timestamps: true },
);

TopicSchema.index({ subject: 1, name: 1 });
TopicSchema.index({ subject: 1, category: 1 });

export default mongoose.models.Topic || mongoose.model("Topic", TopicSchema);