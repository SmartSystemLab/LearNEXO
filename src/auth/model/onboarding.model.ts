import { model, Schema } from "mongoose";
import paginator from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Auth", required: true },
    userId: { type: String, required: true, index: true },

    dateOfBirth: { type: Date, default: null },
    studentClass: { type: String, default: null },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null
    },

    stateOfOrigin: { type: String, default: null },
    residentialAddress: { type: String, default: null },
    town: { type: String, default: null },
    state: { type: String, default: null },

    schoolName: { type: String, default: null },
    schoolAddress: { type: String, default: null },

    learningProfile: {
      learningStyle: {
        type: String,
        enum: ["visual", "auditory", "reading", "kinesthetic"],
        default: null
      },
      confidence: { type: Number, default: null },
      cognitiveScore: { type: Number, default: null },
      recommendedFormats: [{ type: String }],
      explanation: { type: String, default: null },
      risk_of_misclassification: {
        type: String,
        enum: ["low", "medium", "high"],
        default: null
      },
      lastUpdated: { type: Date, default: null }
    },

    pastExam: {
      firstTerm: { type: String, default: null },
      secondTerm: { type: String, default: null },
      thirdTerm: { type: String, default: null }
    },

    photo: { type: String, default: null },

    language: { type: String, default: null },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

schema.plugin(paginator);
schema.plugin(mongooseAggregatePaginate);
export default model("Onboarding", schema, "onboarding");
