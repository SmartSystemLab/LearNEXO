import mongoose, { Schema, Document } from "mongoose";

export interface ISubject extends Document {
  name: string; // english
  code?: string; // ENG
  description?: string;

 
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

  },
  { timestamps: true },
);

// optional but useful
SubjectSchema.index({ name: 1 });

export default mongoose.model<ISubject>("Subject", SubjectSchema);
