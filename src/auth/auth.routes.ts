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
} from "./auth.controller";

const upload = multer({ dest: "uploads/" });
const authRoute = express.Router();

/**
 * @openapi
 * /auth/sign-up:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
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
 *               - learningStyle
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

export default authRoute;
