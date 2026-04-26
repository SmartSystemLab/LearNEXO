import express from "express";
import {
  bulkUploadQuestions,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getAssessmentQuestions,
  getQuestionsByTopic,
} from "./assessment.controller";

const assessmentRoute = express.Router();

/**
 * @openapi
 * /assessment/questions/bulk-upload:
 *   post:
 *     tags:
 *       - Assessment
 *     summary: Bulk upload assessment questions
 *     description: Upload multiple assessment questions with subject, class, topic, and difficulty.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - questionNumber
 *                 - subject
 *                 - class
 *                 - topic
 *                 - question
 *                 - options
 *                 - answer
 *                 - difficulty
 *                 - category
 *               properties:
 *                 questionNumber:
 *                   type: string
 *                   example: "G001"
 *
 *                 subject:
 *                   type: string
 *                   example: "English"
 *
 *                 class:
 *                   type: string
 *                   example: "JSS2"
 *
 *                 topic:
 *                   type: string
 *                   example: "grammar"
 *
 *                 question:
 *                   type: string
 *
 *                 options:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                         example: "a"
 *                       text:
 *                         type: string
 *
 *                 answer:
 *                   type: string
 *                   example: "b"
 *
 *                 difficulty:
 *                   type: string
 *                   enum: [easy, medium, hard]
 *
 *                 category:
 *                   type: string
 *                   enum: [grammar, comprehension, vocabulary, oral, writing]
 *
 *                 explanation:
 *                   type: string
 *
 *     responses:
 *       201:
 *         description: Questions uploaded successfully
 */
assessmentRoute.post("/questions/bulk-upload", bulkUploadQuestions);


/**
  * @openapi
 * /assessment/questions:
 *   get:
 *     tags:
 *       - Assessment
 *     summary: Get all assessment questions
 *     description: Retrieves all questions in the system (admin use).
 *     responses:
 *       200:
 *         description: List of all questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                   example: 120
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 */
assessmentRoute.get("/questions", getAllQuestions);

/**
 * @openapi
 * /assessment/questions/{questionNumber}:
 *   get:
 *     tags:
 *       - Assessment
 *     summary: Get a single assessment question by question number
 *     description: |
 *       Retrieves a specific assessment question using its unique questionNumber identifier.
 *       This endpoint returns the full question object including subject, class, topic,
 *       question text, multiple-choice options, and the correct answer.
 *
 *     parameters:
 *       - in: path
 *         name: questionNumber
 *         required: true
 *         description: Unique identifier of the question (e.g. ENG-JSS2-016)
 *         schema:
 *           type: string
 *           example: ENG-JSS2-016
 *
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 question:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 69edd0daa100bf53f28ba673
 *                     questionNumber:
 *                       type: string
 *                       example: ENG-JSS2-016
 *                     subject:
 *                       type: string
 *                       example: english
 *                     class:
 *                       type: string
 *                       example: jss2
 *                     topic:
 *                       type: string
 *                       example: vowel_sounds
 *                     question:
 *                       type: string
 *                       example: Which is a vowel sound?
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["A", "E", "B", "C"]
 *                     answer:
 *                       type: string
 *                       example: E
 *
 *       404:
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question not found
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
assessmentRoute.get("/questions/:questionNumber", getQuestionById);

/**
 * @openapi
 * /assessment/questions/{questionNumber}:
 *   patch:
 *     tags:
 *       - Assessment
 *     summary: Update a question
 *     description: Update fields of an existing question by questionNumber.
 *     parameters:
 *       - in: path
 *         name: questionNumber
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       404:
 *         description: Question not found
 */
assessmentRoute.patch("/questions/:questionNumber", updateQuestion);

/**
 * @openapi
 * /assessment/questions/{questionNumber}:
 *   delete:
 *     tags:
 *       - Assessment
 *     summary: Delete a question
 *     description: Removes a question permanently using its questionNumber.
 *     parameters:
 *       - in: path
 *         name: questionNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 */assessmentRoute.delete("/questions/:questionNumber", deleteQuestion);

/**
 * @openapi
 * /assessment/{subject}/{class}:
 *   get:
 *     tags:
 *       - Assessment
 *     summary: Get initial assessment questions
 *     description: |
 *       Fetch a randomized set of questions for a subject and class.
 *       This is used to start an assessment session.
 *
 *     parameters:
 *       - in: path
 *         name: subject
 *         required: true
 *         schema:
 *           type: string
 *         example: english
 *
 *       - in: path
 *         name: class
 *         required: true
 *         schema:
 *           type: string
 *         example: JSS2
 *
 *     responses:
 *       200:
 *         description: Assessment questions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                   example: 20
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 */
assessmentRoute.get("/:subject/:gradeClass", getAssessmentQuestions);

/**
 * @openapi
 * /assessment/{subject}/{class}/topic/{topic}:
 *   get:
 *     tags:
 *       - Assessment
 *     summary: Get questions by topic
 *     description: Fetch questions for a specific topic within a subject and class.
 *
 *     parameters:
 *       - in: path
 *         name: subject
 *         required: true
 *         schema:
 *           type: string
 *         example: english
 *
 *       - in: path
 *         name: class
 *         required: true
 *         schema:
 *           type: string
 *         example: JSS2
 *
 *       - in: path
 *         name: topic
 *         required: true
 *         schema:
 *           type: string
 *         example: grammar
 *
 *     responses:
 *       200:
 *         description: Topic questions fetched successfully
 */
assessmentRoute.get("/:subject/:gradeClass/topic/:topic", getQuestionsByTopic);


export default assessmentRoute;
