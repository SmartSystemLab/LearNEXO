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
        role: { type: String, enum: Object.values(EUserRole), default: EUserRole.STUDENT },
        isVerified: { type: Boolean, default: false },
        otp: { type: String, default: null },
        otpExpiresIn: { type: String, default: null },
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);
schema.plugin(paginator);
schema.plugin(mongooseAggregatePaginate);
export default model("Auth", schema, "auth");