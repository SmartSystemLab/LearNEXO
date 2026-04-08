import { Request, Response } from "express";
import { QuestionModel } from "./model/question.model";
import { LearningResponseModel } from "./model/response.model";
import { LearningStyleModel } from "./model/result.model";

export const getLearningStyleQuestions = async (
  req: Request,
  res: Response,
) => {
  const questions = await QuestionModel.find();

  res.json({
    message: "Questions fetched successfully",
    data: questions,
  });
};

export const submitLearningStyle = async (req: Request, res: Response) => {
  const { student_id, questionnaire, student_activity, student_profile } =
    req.body;

  try {
    // 1. Save raw response
    await LearningResponseModel.create({
      student_id,
      questionnaire,
      student_activity,
      student_profile,
    });

    // 2. Call AI (FastAPI) using fetch
    const response = await fetch(
      "https://learnexo-ai.onrender.com/learning-style/evaluate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_profile,
          questionnaire,
          student_activity,
        }),
      },
    );

    // 3. Handle bad response (because fetch won’t do it for you like a nanny)
    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const result = await response.json();

    // 4. Save AI result
    await LearningStyleModel.create({
      student_id,
      ...result,
    });

    // 5. Return response
    res.json({
      message: "Learning style evaluated",
      data: result,
    });
  } catch (error: any) {
    console.error("Learning style error:", error.message);

    res.status(500).json({
      message: "Failed to evaluate learning style",
      error: error.message,
    });
  }
};
