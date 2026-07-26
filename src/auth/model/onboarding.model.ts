/**
 * @swagger
 * components:
 *   schemas:
 *     Onboarding:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *           description: ObjectId ref to Auth
 *         userId:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         studentClass:
 *           type: string
 *           nullable: true
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           nullable: true
 *         stateOfOrigin:
 *           type: string
 *           nullable: true
 *         residentialAddress:
 *           type: string
 *           nullable: true
 *         town:
 *           type: string
 *           nullable: true
 *         state:
 *           type: string
 *           nullable: true
 *         schoolName:
 *           type: string
 *           nullable: true
 *         schoolAddress:
 *           type: string
 *           nullable: true
 *         learningProfile:
 *           type: object
 *           properties:
 *             learningStyle:
 *               type: string
 *               enum: [visual, auditory, reading, kinesthetic]
 *               nullable: true
 *             confidence:
 *               type: number
 *               nullable: true
 *             cognitiveScore:
 *               type: number
 *               nullable: true
 *             recommendedFormats:
 *               type: array
 *               items:
 *                 type: string
 *             explanation:
 *               type: string
 *               nullable: true
 *             risk_of_misclassification:
 *               type: string
 *               enum: [low, medium, high]
 *               nullable: true
 *             lastUpdated:
 *               type: string
 *               format: date-time
 *               nullable: true
 *         pastExam:
 *           type: object
 *           properties:
 *             firstTerm:
 *               type: string
 *               nullable: true
 *             secondTerm:
 *               type: string
 *               nullable: true
 *             thirdTerm:
 *               type: string
 *               nullable: true
 *         photo:
 *           type: string
 *           nullable: true
 *         language:
 *           type: string
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
