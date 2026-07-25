import express from "express";
import {
  bulkUploadQuestions,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getAssessmentQuestions,
  getQuestionsByTopic,
  submitAssessment,
  getAssessmentHistory,
  getAssessmentInsightById,
  getAssessmentCorrections,
  getAssessmentReport,
  getAnalytics,
  getRecommendedContent,
} from "./assessment.controller";
import { verifyJwt } from "../middleware/verifyJwt";

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
/**
 * @openapi
 * /assessment/history:
 *   get:
 *     tags:
 *       - Assessment
 *     summary: Get assessment history
 *     description: Returns all completed assessments for the authenticated user with titles, scores, and dates.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of completed assessments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       assessmentId:
 *                         type: string
 *                       subject:
 *                         type: string
 *                       class:
 *                         type: string
 *                       type:
 *                         type: string
 *                       score:
 *                         type: number
 *                       completedAt:
 *                         type: string
 *                         format: date-time
 *                       title:
 *                         type: string
 *                         example: "English — Comprehension"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
assessmentRoute.get("/history", verifyJwt, getAssessmentHistory);

/**
 * @openapi
 * /assessment/{assessmentId}/insight:
 *   get:
 *     tags:
 *       - Assessment
 *     summary: Get insight for a specific assessment
 *     description: Returns weak/strong topics, recommendations, and AI content for a specific completed assessment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *         example: "64f1a2b3c9d4e5f678901234"
 *     responses:
 *       200:
 *         description: Assessment insight
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasInsight:
 *                   type: boolean
 *                 score:
 *                   type: number
 *                 weakTopics:
 *                   type: array
 *                 strongTopics:
 *                   type: array
 *                 recommendedNextTopic:
 *                   type: object
 *                 explanation:
 *                   type: string
 *                 recommendations:
 *                   type: array
 *                 aiContent:
 *                   type: array
 *       404:
 *         description: Assessment not found or not completed
 *       500:
 *         description: Internal server error
 */
assessmentRoute.get("/:assessmentId/insight", verifyJwt, getAssessmentInsightById);

/**
 * @openapi
 * /assessment/{assessmentId}/corrections:
 *   get:
 *     tags:
 *       - Assessment
 *     summary: Get question corrections for an assessment
 *     description: Returns each question with the user's answer, correct answer, and explanation.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Corrections list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assessmentId:
 *                   type: string
 *                 totalQuestions:
 *                   type: number
 *                 attempted:
 *                   type: number
 *                 corrections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       questionNumber:
 *                         type: number
 *                       question:
 *                         type: string
 *                       userAnswer:
 *                         type: string
 *                       correctAnswer:
 *                         type: string
 *                       isCorrect:
 *                         type: boolean
 *                       explanation:
 *                         type: string
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Internal server error
 */
assessmentRoute.get("/:assessmentId/corrections", verifyJwt, getAssessmentCorrections);

/**
 * @openapi
 * /assessment/{assessmentId}/report:
 *   get:
 *     tags:
 *       - Assessment
 *     summary: Get full assessment report
 *     description: Bundles insight, corrections, and recommendations into a single report.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full report
 *       404:
 *         description: Assessment not found or not completed
 *       500:
 *         description: Internal server error
 */
assessmentRoute.get("/:assessmentId/report", verifyJwt, getAssessmentReport);

/**
 * @openapi
 * /assessment/analytics:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get learning analytics
 *     description: Returns class mastery, subject progress over time, and topic mastery comparison charts data.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 classMastery:
 *                   type: object
 *                 subjectProgress:
 *                   type: object
 *                 topicComparison:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
assessmentRoute.get("/analytics", verifyJwt, getAnalytics);

/**
 * @openapi
 * /assessment/courses:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get recommended learning content
 *     description: Returns AI-recommended learning materials grouped by subject.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommended content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recent:
 *                   type: array
 *                 bySubject:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
assessmentRoute.get("/courses", verifyJwt, getRecommendedContent);

assessmentRoute.get("/:subject/:gradeClass",verifyJwt, getAssessmentQuestions) ;

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

/**
 * @openapi
 * /assessment/submit:
 *   post:
 *     tags:
 *       - Assessment
 *     summary: Submit assessment answers and compute result
 *     description: >
 *       Submits a completed assessment, calculates the score,
 *       determines weak and strong topics, updates topic mastery,
 *       and optionally generates personalized learning content.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assessmentId
 *               - answers
 *             properties:
 *               assessmentId:
 *                 type: string
 *                 example: "64f1a2b3c9d4e5f678901234"
 *
 *               answers:
 *                 type: array
 *                 description: List of answers submitted by the user
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionId
 *                     - selected
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       example: "64f1a2b3c9d4e5f67890abcd"
 *
 *                     selected:
 *                       type: string
 *                       description: Selected option key (e.g. a, b, c, d)
 *                       example: "a"
 *
 *     responses:
 *       200:
 *         description: Assessment submitted and processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: number
 *                   example: 65
 *
 *                 weakTopics:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["topicId1", "topicId2"]
 *
 *                 strongTopics:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["topicId3"]
 *
 *                 topicBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       topicInstanceId:
 *                         type: string
 *                         example: "64fTopic123"
 *
 *                       correct:
 *                         type: number
 *                         example: 3
 *
 *                       total:
 *                         type: number
 *                         example: 5
 *
 *                       score:
 *                         type: number
 *                         example: 60
 *
 *                 content:
 *                   type: object
 *                   description: AI-generated learning resources (optional)
 *
 *       400:
 *         description: Invalid request payload or already submitted
 *
 *       404:
 *         description: Assessment not found
 *
 *       500:
 *         description: Internal server error
 */
assessmentRoute.post("/submit", verifyJwt, submitAssessment);


export default assessmentRoute;
