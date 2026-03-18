import express, { Request, Response } from "express";
import AssessmentController from "./assessment.controller";
import { createQuestionValidation } from "./types/validation.schema";
import { validateRequest } from "../middleware/validation";
import { AnswerQuestionDto, CreateQuestionDto } from "./types/dto.types";

const assessmentRoute = express.Router();

assessmentRoute.post(
  "/",
  validateRequest(createQuestionValidation),
  async (
    req: Request<Record<string, never>, unknown, CreateQuestionDto[]>,
    res: Response<unknown>,
  ): Promise<void> => {
    const assessmentService = new AssessmentController();
    const data = await assessmentService.createAssessment(req.body);
    const { statusCode, ...responseData } = data;
    res.status(statusCode).send({ ...responseData });
  },
);

assessmentRoute.get(
  "/:category",
  async (
    req: Request<
      { category: "Assessment" | "Questionnaire" },
      Record<string, never>,
      Record<string, never>
    >,
    res: Response<unknown>,
  ): Promise<void> => {
    const assessmentService = new AssessmentController();
    const data = await assessmentService.getAssessment(req.params.category);
    const { statusCode, ...responseData } = data;
    res.status(statusCode).send({ ...responseData });
  },
);

assessmentRoute.get(
  "/:subject/:gradeClass",
  async (
    req: Request<
      { subject: string; gradeClass: string },
      Record<string, never>,
      Record<string, never>
    >,
    res: Response<unknown>,
  ): Promise<void> => {
    const assessmentService = new AssessmentController();
    const data = await assessmentService.getQuestions(
      req.params.subject,
      req.params.gradeClass,
    );
    const { statusCode, ...responseData } = data;
    res.status(statusCode).send({ ...responseData });
  },
);

assessmentRoute.post(
  "/get-score",
  async (
    req: Request<Record<string, never>, unknown, AnswerQuestionDto[]>,
    res: Response<unknown>,
  ): Promise<void> => {
    const assessmentService = new AssessmentController();
    const data = await assessmentService.getScore(req.body);
    const { statusCode, ...responseData } = data;
    res.status(statusCode).send({ ...responseData });
  },
);

export default assessmentRoute;
