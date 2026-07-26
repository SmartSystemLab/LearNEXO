/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: english
 *         code:
 *           type: string
 *           example: ENG
 *           nullable: true
 *         description:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
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
