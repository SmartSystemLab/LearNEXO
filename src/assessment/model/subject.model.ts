import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubject extends Document {
  name: string; // english
  code?: string; // ENG
  description?: string;

  classes: {
    className: string; // jss1, jss2, jss3
    topics: Types.ObjectId[]; // TopicInstance IDs
  }[];
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    code: {
      type: String,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
    },

    classes: [
      {
        className: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },

        topics: [
          {
            type: Schema.Types.ObjectId,
            ref: "TopicInstance",
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

// optional but useful
SubjectSchema.index({ name: 1 });

export default mongoose.model<ISubject>("Subject", SubjectSchema);
