import { model, Schema } from "mongoose";
import paginator from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const schema = new Schema(
  {
    questionNumber: { type: String, required: true },
    question: { type: String, required: true },
    options: {
      a: { type: String, required: true },
      b: { type: String, required: true },
      c: { type: String, required: true },
      d: { type: String, required: true },
      e: { type: String, required: true },
    },
    answer: {
      type: String,
      enum: ['a', 'b', 'c', 'd', 'e', 'N/A'], 
      default: 'N/A',
      required: true,
    },
    category: {
      type: String,
      enum: ['Assessment', 'Questionnaire'],
      default: 'Assessment',
      required: true,}
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

schema.plugin(paginator);
schema.plugin(mongooseAggregatePaginate);
export default model("Question", schema, "question");