import { model, Schema } from "mongoose";
import paginator from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const schema = new Schema(
    {
        email: { type: String, default: null },
        otp: { type: String, default: null },
        otpExpiresIn: { type: String, default: null },
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);
schema.plugin(paginator);
schema.plugin(mongooseAggregatePaginate);
export default model("Otp", schema, "otp");