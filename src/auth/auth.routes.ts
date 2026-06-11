import express from "express";
import multer from "multer";

import {
  createUserValidation,
  loginUserValidation,
  onboardingValidation,
  verifyValidation,
} from "./types/validation.schema.type";

import { validateRequest } from "../middleware/validation";
import { verifyJwt } from "../middleware/verifyJwt";
import { parseFormData } from "../middleware/parseFormData";

import {
  signUp,
  login,
  verifyOtp,
  sendOtp,
  resetPassword,
  onboarding,
  getProfile,
  updateProfile,
} from "./auth.controller";

const upload = multer({ dest: "uploads/" });
const authRoute = express.Router();
/**
 * @openapi
 * /auth/sign-up:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user account
 *     description: >
 *       Creates a new user account with role-based identification.
 *       The system hashes the user's password, generates a unique userId,
 *       and sends an OTP to the provided email for verification.
 *
 *       Note:
 *       - Email must be unique.
 *       - Password is securely hashed before storage.
 *       - OTP verification is required to activate the account.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: oliverpraise1@gmail.com
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123
 *
 *               firstName:
 *                 type: string
 *                 example: Praise
 *
 *               lastName:
 *                 type: string
 *                 example: Olive
 *
 *               role:
 *                 type: string
 *                 enum: [student, parent, teacher, admin, super_admin]
 *                 default: student
 *                 example: student
 *
 *     responses:
 *       201:
 *         description: User created successfully (OTP sent to email)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *
 *                 statusCode:
 *                   type: number
 *                   example: 201
 *
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 664ab12cd98ef00123abc456
 *
 *                     userId:
 *                       type: string
 *                       description: Role-based unique identifier
 *                       example: STU-839201
 *
 *                     email:
 *                       type: string
 *                       example: oliverpraise1@gmail.com
 *
 *                     firstName:
 *                       type: string
 *                       example: Praise
 *
 *                     lastName:
 *                       type: string
 *                       example: Olive
 *
 *                     role:
 *                       type: string
 *                       example: student
 *
 *       400:
 *         description: User already exists or invalid input
 *         content:
 *           application/json:
 *             example:
 *               status: false
 *               statusCode: 400
 *               message: User already exists
 *               data: null
 *
 *       500:
 *         description: Internal server error
 */
authRoute.post("/sign-up", validateRequest(createUserValidation), signUp);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
authRoute.post("/login", validateRequest(loginUserValidation), login);

/**
 * @openapi
 * /auth/verify-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 */
authRoute.post("/verify-otp", validateRequest(verifyValidation), verifyOtp);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
authRoute.post(
  "/reset-password",
  validateRequest(loginUserValidation),
  resetPassword,
);

/**
 * @openapi
 * /auth/send-otp/{email}:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Send OTP to email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
authRoute.get("/send-otp/:email", sendOtp);

/**
 * @openapi
 * /auth/onboarding:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Complete user onboarding
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - dateOfBirth
 *               - studentClass
 *               - gender
 *               - town
 *               - state
 *               - schoolName
 *             properties:
 *               dateOfBirth:
 *                 type: string
 *               studentClass:
 *                 type: string
 *               gender:
 *                 type: string
 *               town:
 *                 type: string
 *               state:
 *                 type: string
 *               schoolName:
 *                 type: string
 *               schoolAddress:
 *                 type: string
 *               learningStyle:
 *                 type: string
 *               pastExam:
 *                 type: string
 *               language:
 *                 type: string
 *               residentialAddress:
 *                 type: string
 *               stateOfOrigin:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Onboarding completed successfully
 */
authRoute.post(
  "/onboarding",
  verifyJwt,
  upload.single("photo"),
  parseFormData,
  validateRequest(onboardingValidation),
  onboarding,
);

/**
 * @openapi
 * /auth/profile:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get the authenticated user's profile and onboarding info
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       404:
 *         description: User not found
 */
authRoute.get("/profile", verifyJwt, getProfile);

/**
 * @openapi
 * /auth/profile:
 *   patch:
 *     tags:
 *       - Auth
 *     summary: Update the authenticated user's basic profile details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: User not found
 */
authRoute.patch("/profile", verifyJwt, updateProfile);

export default authRoute;
