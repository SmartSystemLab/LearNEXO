import { Get, Body, Path, Post, Route, Tags } from "tsoa";
import Question from "./model/questions.model";
import {
  AnswerQuestionDto,
  BuildOptions,
  CreateQuestionDto,
  PredictPayload,
  ScoreResponse,
  TopicDef,
} from "./types/dto.types";
import { Types } from "mongoose";
import axios from "axios";

@Tags("Assessment")
@Route("api/v1/assessment")
export default class AssessmentController {
  @Get("/{category}")
  public async getAssessment(@Path() category: "Assessment" | "Questionnaire") {
    try {
      const data = await Question.find({ category });
      return {
        statusCode: 200,
        status: true,
        message: "Assessments retrieved successfully",
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return {
        status: false,
        statusCode: 500,
        message: message,
        data: null,
      };
    }
  }

  @Get("/{subject}/{gradeClass}")
  public async getQuestions(
    @Path() subject: string,
    @Path() gradeClass: string,
  ) {
    try {
      const data = await Question.find({ subject, class: gradeClass });
      return {
        statusCode: 200,
        status: true,
        message: "Assessments retrieved successfully",
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return {
        status: false,
        statusCode: 500,
        message: message,
        data: null,
      };
    }
  }

  @Post("/")
  public async createAssessment(
    @Body() createQuestionDto: CreateQuestionDto[],
  ) {
    try {
      await Question.insertMany(createQuestionDto);
      return {
        statusCode: 200,
        status: true,
        message: "Assessments submitted successfully",
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return {
        status: false,
        statusCode: 500,
        message: message,
        data: null,
      };
    }
  }

  @Post("/get-score")
  public async getScore(@Body() answers: AnswerQuestionDto[]) {
    try {
      if (!Array.isArray(answers) || answers.length === 0) {
        return {
          status: false,
          statusCode: 400,
          message: "No answers provided",
          data: null,
        };
      }

      const norm = (v: unknown) =>
        String(v ?? "")
          .trim()
          .toLowerCase();

      // collect valid ObjectIds
      const ids = answers
        .map((a) => a?.questionId)
        .filter((id): id is string => !!id && Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));

      // fetch only needed fields; include 'answer' (the dataset’s correct key)
      const questions = await Question.find({ _id: { $in: ids } })
        .select(
          "_id subCategory subcategory topic subTopic subject answer correctAnswer correctAnswers",
        )
        .lean();

      // index by id
      const byId = new Map<
        string,
        { subcategory: string; corrects: Set<string> }
      >();

      for (const q of questions) {
        const subcategory =
          q.subCategory ||
          q.subcategory ||
          q.topic ||
          q.subTopic ||
          q.subject ||
          "Uncategorized";

        const correctsRaw: unknown[] = Array.isArray(q.correctAnswers)
          ? q.correctAnswers
          : q.correctAnswer != null
            ? [q.correctAnswer]
            : q.answer != null
              ? [q.answer]
              : [];

        byId.set(String(q._id), {
          subcategory,
          corrects: new Set(correctsRaw.map(norm)),
        });
      }

      const buckets = new Map<string, { correct: number; total: number }>();
      let totalCorrect = 0;
      let totalQuestions = 0;

      for (const a of answers) {
        if (!a?.questionId || !Types.ObjectId.isValid(a.questionId)) continue;
        const q = byId.get(a.questionId);
        if (!q) continue;

        const b = buckets.get(q.subcategory) ?? { correct: 0, total: 0 };
        b.total += 1;
        totalQuestions += 1;

        const submitted = norm(a.answer);
        if (q.corrects.has(submitted)) {
          b.correct += 1;
          totalCorrect += 1;
        }

        buckets.set(q.subcategory, b);
      }

      const scores: Record<string, number> = {};
      const breakdown: Record<string, { correct: number; total: number }> = {};

      for (const [subcat, { correct, total }] of buckets.entries()) {
        breakdown[subcat] = { correct, total };
        scores[subcat] = total ? Math.round((correct / total) * 100) : 0;
      }

      const resp = {
        scores,
        breakdown,
        total: { correct: totalCorrect, total: totalQuestions },
      };

      const mapping = {
        Reading: {
          topic_id: "read",
          name: "Reading",
          tags: ["english", "read"],
          prerequisite: null,
        },
        Writing: {
          topic_id: "Writing",
          name: "Fractions",
          tags: ["english", "write"],
          prerequisite: null,
        },
        "Listening & Speaking": {
          topic_id: "list-speak",
          name: "Listening & Speaking",
          tags: ["english", "list-speak"],
          prerequisite: null,
        },
      };

      const predictBody = this.buildPredictPayload(resp, {
        student: "student_1",
        mapping,
        mastery_threshold: 70,
        enrich_with_llm: true,
      });

      const data = await this.callPredict(predictBody);

      return {
        statusCode: 200,
        status: true,
        message: "Scores computed successfully",
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return {
        status: false,
        statusCode: 500,
        message: message,
        data: null,
      };
    }
  }

  buildPredictPayload(resp: ScoreResponse, opts: BuildOptions): PredictPayload {
    const {
      student,
      mapping,
      mastery_threshold = 70,
      enrich_with_llm = true,
    } = opts;

    const outScores: Record<string, number> = {};
    const topicsById = new Map<string, TopicDef>();

    for (const [subcategory, pct] of Object.entries(resp.scores || {})) {
      const topic = mapping[subcategory];
      if (!topic) continue; // skip any subcategory without a mapping
      topicsById.set(topic.topic_id, topic);
      // Use the percentage score (rounded)
      outScores[topic.topic_id] = Math.round(Number(pct));
    }

    return {
      student,
      scores: outScores,
      topics: Array.from(topicsById.values()),
      mastery_threshold,
      enrich_with_llm,
    };
  }

  async callPredict(resp: unknown) {
    const client = axios.create({
      baseURL: process.env.PREDICT_API_URL || "http://127.0.0.1:8001",
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });
    try {
      const { data } = await client.post("/predict", resp);
      return data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message;
        console.error("Predict failed:", detail, err.response?.data);
        throw new Error(detail);
      }
      throw err;
    }
  }
}
