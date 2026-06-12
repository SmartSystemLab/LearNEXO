import { RequestHandler } from "express";
import Question from "./model/question.model";
import Auth from "../auth/model/auth.model";
import Onboarding from "../auth/model/onboarding.model";
import { AuthenticatedRequest } from "../middleware/verifyJwt";

export const bulkUploadQuestions: RequestHandler = async (req, res) => {
  try {
    const questions = req.body;

    await Question.insertMany(questions);

    res.status(201).json({
      message: "Questions uploaded successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const getAllQuestions: RequestHandler = async (_req, res) => {
  try {
    const questions = await Question.find().sort({ questionNumber: 1 });
    const total = await Question.countDocuments();

    res.status(200).json({
      total,
      questions,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const getQuestionById: RequestHandler = async (req, res) => {
  try {
    const questionNumber = (req.params.questionNumber as string).padStart(3, "0");

    const question = await Question.findOne({ questionNumber });

    if (!question) {
      res.status(404).json({ message: "Question not found" });
      return;
    }

    res.status(200).json({ question });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};
export const updateQuestion: RequestHandler = async (req, res) => {
  try {
    const questionNumber = (req.params.questionNumber as string).padStart(3, "0");

    const updated = await Question.findOneAndUpdate(
      { questionNumber },
      req.body,
      { new: true },
    );

    if (!updated) {
      res.status(404).json({ message: "Question not found" });
      return;
    }

    res.status(200).json({ message: "Question updated", updated });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const deleteQuestion: RequestHandler = async (req, res) => {
  try {
    const questionNumber = (req.params.questionNumber as string).padStart(3, "0");

    const deleted = await Question.findOneAndDelete({ questionNumber });

    if (!deleted) {
      res.status(404).json({ message: "Question not found" });
      return;
    }

    res.status(200).json({ message: "Question deleted" });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const submitQuestionnaire: RequestHandler = async (req, res) => {
  try {
    const { user: authUser } = req as AuthenticatedRequest;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ message: "Invalid payload" });
      return;
    }

    const user = await Auth.findById(authUser.id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const onboarding = await Onboarding.findOne({ user: user._id });

    const questionNumbers = answers.map((a: any) => a.questionNumber);

    const questions = await Question.find({
      questionNumber: { $in: questionNumbers },
    });

    const questionMap = new Map();
    questions.forEach((q) => {
      questionMap.set(q.questionNumber, q);
    });

    /* SCORING SYSTEM */
    const learningStyleScores: Record<string, number> = {
      visual: 0,
      auditory: 0,
      reading: 0,
      kinesthetic: 0,
    };

    let correctAnswers = 0;
    let totalCognitive = 0;

    for (const ans of answers) {
      const question = questionMap.get(ans.questionNumber);
      if (!question) continue;

      const selectedOption = question.options.find(
        (opt: any) => opt.key === ans.selected,
      );

      if (!selectedOption) continue;

      if (selectedOption.trait) {
        learningStyleScores[selectedOption.trait] += 1;
      }

      if (question.answer && question.answer !== "N/A") {
        totalCognitive++;

        if (ans.selected === question.answer) {
          correctAnswers++;
        }
      }
    }

    const cognitiveScore =
      totalCognitive === 0
        ? 0
        : Math.round((correctAnswers / totalCognitive) * 100);

    /* AI INSIGHTS */
    const aiPayload = {
      learning_style_scores: learningStyleScores,
      cognitive_score: cognitiveScore,
      student_profile: {
        age: onboarding?.dateOfBirth
          ? new Date().getFullYear() - onboarding.dateOfBirth.getFullYear()
          : null,
        class: onboarding?.studentClass,
        language: onboarding?.language,
        state: onboarding?.state,
        town: onboarding?.town,
        residentialAddress: onboarding?.residentialAddress,
        schoolName: onboarding?.schoolName,
        schoolAddress: onboarding?.schoolAddress,
      },
    };

    const response = await fetch(
      "https://learnexo-ai-1.onrender.com/api/learning-style/detailed",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aiPayload),
      },
    );

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const aiResponse = await response.json();

    const learningProfile = {
      learningStyle: aiResponse.learning_style,
      confidence: aiResponse.confidence,
      recommendedFormats: aiResponse.recommended_formats,
      explanation: aiResponse.explanation,
      risk_of_misclassification: aiResponse.risk_of_misclassification,
      cognitiveScore,
      lastUpdated: new Date(),
    };

    /* UPDATE USER PROFILE */
    const userOnboarding = await Onboarding.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        learningProfile,
      },
      { new: true, upsert: true },
    );

     res.status(200).json({
      learningProfile,
      userOnboarding,
    });
  } catch (error: any) {
     res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};
