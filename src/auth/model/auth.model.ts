/**
 * @swagger
 * components:
 *   schemas:
 *     Auth:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64c0a1b2c3d4e5f6a7b8c9d0
 *         firstName:
 *           type: string
 *           nullable: true
 *         lastName:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *           nullable: true
 *         password:
 *           type: string
 *           nullable: true
 *         role:
 *           $ref: '#/components/schemas/EUserRole'
 *         isVerified:
 *           type: boolean
 *           default: false
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
import { model, Schema } from "mongoose";
import paginator from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { EUserRole } from "../types/enums.type";

const schema = new Schema(
  {
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    email: { type: String, default: null },
    password: { type: String, default: null },
    role: {
      type: String,
      enum: Object.values(EUserRole),
      default: EUserRole.STUDENT,
    },
    isVerified: { type: Boolean, default: false },
    userId: {
      type: String,
      unique: true,
      index: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);
schema.plugin(paginator);
schema.plugin(mongooseAggregatePaginate);
export default model("Auth", schema, "auth");