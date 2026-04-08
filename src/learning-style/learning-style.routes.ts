import { Router } from "express";
import {
  getLearningStyleQuestions,
  submitLearningStyle,
} from "./learning-style.controller";

const router = Router();

router.get("/questions", getLearningStyleQuestions);
router.post("/submit", submitLearningStyle);

export default router;
