import { model, Schema } from "mongoose";
import paginator from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const schema = new Schema(
    {
        todayGoal: { type: String, default: null },
        subJectsInProgress: { type: Number, default: 0 },
        assessmentTaken: { type: Number, default: 0 },
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);
schema.plugin(paginator);
schema.plugin(mongooseAggregatePaginate);
export default model("Auth", schema, "auth");