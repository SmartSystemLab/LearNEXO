/**
 * @swagger
 * components:
 *   schemas:
 *     Otp:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *           nullable: true
 *         otp:
 *           type: string
 *           nullable: true
 *         otpExpiresIn:
 *           type: string
 *           format: date-time
 *           nullable: true
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

const schema = new Schema(
    {
        email: { type: String, default: null },
        otp: { type: String, default: null },
        otpExpiresIn: { type: Date, default: null },
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);
schema.plugin(paginator);
schema.plugin(mongooseAggregatePaginate);
export default model("Otp", schema, "otp");