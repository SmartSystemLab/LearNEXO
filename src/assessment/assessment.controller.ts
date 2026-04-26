import { RequestHandler } from "express";
import AssessmentQuestion from "./model/assessmentQuestion.model";

export const bulkUploadQuestions: RequestHandler = async (req, res) => {
  try {
    const questions = req.body;

    await AssessmentQuestion.insertMany(questions);

    res.status(201).json({
      message: "Assessment questions uploaded successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const getAssessmentQuestions: RequestHandler = async (req, res) => {
  try {
    const { subject, gradeClass } = req.params;


    const categories = [
      "grammar",
      "comprehension",
      "vocabulary",
      "oral",
      "writing",
    ];

    const questions = await AssessmentQuestion.aggregate([
      {
        $match: {
          subject,
          class: gradeClass,
          category: { $in: categories },
        },
      },
      {
        $facet: {
          grammar: [
            { $match: { category: "grammar" } },
            { $sample: { size: 5 } },
          ],
          comprehension: [
            { $match: { category: "comprehension" } },
            { $sample: { size: 5 } },
          ],
          vocabulary: [
            { $match: { category: "vocabulary" } },
            { $sample: { size: 5 } },
          ],
          oral: [{ $match: { category: "oral" } }, { $sample: { size: 5 } }],
          writing: [
            { $match: { category: "writing" } },
            { $sample: { size: 5 } },
          ],
        },
      },
      {
        $project: {
          questions: {
            $concatArrays: [
              "$grammar",
              "$comprehension",
              "$vocabulary",
              "$oral",
              "$writing",
            ],
          },
        },
      },
      {
        $unwind: "$questions",
      },
      {
        $replaceRoot: { newRoot: "$questions" },
      },
    ]);


    res.status(200).json({
      total: questions.length,
      questions,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const getQuestionsByTopic: RequestHandler = async (req, res) => {
  try {
    const { subject, gradeClass, topic } = req.params;

    const questions = await AssessmentQuestion.find({
      subject,
      class: gradeClass,
      topic,
    });

    console.log("Found:", questions.length);

    res.status(200).json({
      total: questions.length,
      questions,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const getAllQuestions: RequestHandler = async (_req, res) => {
  try {
    const questions = await AssessmentQuestion.find().sort({
      questionNumber: 1,
    });
    const total = await AssessmentQuestion.countDocuments();

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
    const {questionNumber }= req.params;

    const question = await AssessmentQuestion.findOne({ questionNumber });


    if (!question) {
       res.status(404).json({
        message: "Question not found",
      });
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
    const questionNumber = req.params.questionNumber;

    const updated = await AssessmentQuestion.findOneAndUpdate(
      { questionNumber },
      req.body,
      { new: true },
    );

    if (!updated) {
       res.status(404).json({
        message: "Question not found",
      });
    }

    res.status(200).json({
      message: "Question updated",
      updated,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const deleteQuestion: RequestHandler = async (req, res) => {
  try {
    const questionNumber = req.params.questionNumber;

    const deleted = await AssessmentQuestion.findOneAndDelete({
      questionNumber,
    });

    if (!deleted) {
       res.status(404).json({
        message: "Question not found",
      });
    }

    res.status(200).json({
      message: "Question deleted",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};