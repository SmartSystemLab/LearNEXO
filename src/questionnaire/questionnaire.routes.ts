import express from "express";
import {
  bulkUploadQuestions,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  submitQuestionnaire
} from "./questionnaire.controller";
import { verifyJwt } from "../middleware/verifyJwt";

const questionnaireRoute = express.Router();

/**
 * @openapi
 * /questionnaire/questions/bulk-upload:
 *   post:
 *     tags:
 *       - Questionnaire
 *     summary: Bulk upload questionnaire questions
 *     description: |
 *       Upload multiple questions at once. Each question must follow the required structure for either learning style or cognitive questions.
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
 *                 - question
 *                 - options
 *                 - category
 *               properties:
 *                 questionNumber:
 *                   type: string
 *                   example: "001"
 *
 *                 question:
 *                   type: string
 *                   example: "What is 7 × 6?"
 *
 *                 category:
 *                   type: string
 *                   enum: [learning_style, cognitive]
 *
 *                 answer:
 *                   type: string
 *                   example: "b"
 *
 *                 options:
 *                   type: array
 *                   description: List of answer options
 *                   items:
 *                     type: object
 *                     required:
 *                       - key
 *                       - text
 *                     properties:
 *                       key:
 *                         type: string
 *                         example: "a"
 *
 *                       text:
 *                         type: string
 *                         example: "42"
 *
 *                       trait:
 *                         type: string
 *                         enum: [visual, auditory, reading, kinesthetic, neutral]
 *                         example: visual
 *     responses:
 *       201:
 *         description: Questions uploaded successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
questionnaireRoute.post("/questions/bulk-upload", bulkUploadQuestions);

/**
 * @openapi
 * /questionnaire/questions:
 *   get:
 *     tags:
 *       - Questionnaire
 *     summary: Get all questions
 *     description: Returns all questions in the system along with total count. Questions are sorted by questionNumber in ascending order.
 *     responses:
 *       200:
 *         description: Questions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 15
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 69e0aa284a31c48d6019e9ef
 *                       questionNumber:
 *                         type: string
 *                         example: "001"
 *                       question:
 *                         type: string
 *                       options:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             key:
 *                               type: string
 *                               example: a
 *                             text:
 *                               type: string
 *                             trait:
 *                               type: string
 *                               enum: [visual, auditory, reading, kinesthetic, neutral]
 *                       category:
 *                         type: string
 *                         enum: [learning_style, cognitive]
 *                       answer:
 *                         type: string
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
questionnaireRoute.get("/questions", getAllQuestions);

/**
 * @openapi
 * /questionnaire/questions/{questionNumber}:
 *   get:
 *     tags:
 *       - Questionnaire
 *     summary: Get a question by questionNumber
 *     description: Fetch a single question using its unique questionNumber (e.g. "001", "012").
 *     parameters:
 *       - in: path
 *         name: questionNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique question number
 *         example: "001"
 *     responses:
 *       200:
 *         description: Question fetched successfully
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
 *                     questionNumber:
 *                       type: string
 *                       example: "001"
 *                     question:
 *                       type: string
 *                     options:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           key:
 *                             type: string
 *                             example: "a"
 *                           text:
 *                             type: string
 *                           trait:
 *                             type: string
 *                             enum: [visual, auditory, reading, kinesthetic, neutral]
 *                     category:
 *                       type: string
 *                       enum: [learning_style, cognitive]
 *                     answer:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Question not found
 *       500:
 *         description: Internal server error
 */
questionnaireRoute.get("/questions/:questionNumber", getQuestionById);

/**
 * @openapi
 * /questionnaire/questions/{questionNumber}:
 *   patch:
 *     tags:
 *       - Questionnaire
 *     summary: Update a question by questionNumber
 *     description: Update an existing question using its unique questionNumber.
 *     parameters:
 *       - in: path
 *         name: questionNumber
 *         required: true
 *         schema:
 *           type: string
 *         example: "001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     text:
 *                       type: string
 *                     trait:
 *                       type: string
 *                       enum: [visual, auditory, reading, kinesthetic, neutral]
 *               category:
 *                 type: string
 *                 enum: [learning_style, cognitive]
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       404:
 *         description: Question not found
 */
questionnaireRoute.patch("/questions/:questionNumber", updateQuestion);

/**
 * @openapi
 * /questionnaire/questions/{questionNumber}:
 *   delete:
 *     tags:
 *       - Questionnaire
 *     summary: Delete a question by questionNumber
 *     description: Delete a specific question using its unique questionNumber.
 *     parameters:
 *       - in: path
 *         name: questionNumber
 *         required: true
 *         schema:
 *           type: string
 *         example: "001"
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 */
questionnaireRoute.delete("/questions/:questionNumber", deleteQuestion);

/**
 * @openapi
 * /questionnaire/submit:
 *   post:
 *     tags:
 *       - Questionnaire
 *     summary: Submit questionnaire answers and compute learning profile
 *     description: |
 *       Submits user answers for the questionnaire and performs:
 *       
 *       - Learning style scoring (deterministic)
 *       - Cognitive score calculation (for objective questions)
 *       - Optional AI enhancement (learning profile refinement)
 *       
 *       This endpoint processes everything in a single flow and returns the computed results.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionNumber
 *                     - selected
 *                   properties:
 *                     questionNumber:
 *                       type: string
 *                       example: "001"
 *
 *                     selected:
 *                       type: string
 *                       description: Selected option key
 *                       example: "a"
 *
 *     responses:
 *       200:
 *         description: Questionnaire processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 learningProfile:
 *                   type: object
 *                   properties:
 *                     learningStyle:
 *                       type: string
 *                       enum: [visual, auditory, reading, kinesthetic]
 *                       example: visual
 *
 *                     confidence:
 *                       type: number
 *                       example: 0.87
 *
 *                     cognitiveScore:
 *                       type: number
 *                       example: 80
 *
 *                     recommendedFormats:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["videos", "diagrams"]
 *
 *                     explanation:
 *                       type: string
 *                       example: "Student shows strong preference for visual learning methods."
 *
 *                     risk_of_misclassification:
 *                       type: string
 *                       enum: [low, medium, high]
 *                       example: low
 *
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *
 *                 userOnboarding:
 *                   type: object
 *                   description: The user's onboarding record, updated with the computed learningProfile
 *
 *       400:
 *         description: Invalid request payload
 *
 *       404:
 *         description: User or questions not found
 *
 *       500:
 *         description: Internal server error
 */
questionnaireRoute.post("/submit", verifyJwt, submitQuestionnaire);

export default questionnaireRoute;
