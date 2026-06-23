import express from "express";
import {
  getSubjectsWithProgress,
  getCategoriesWithProgress,
  getTopicsWithProgress,
  getSubjectInsight,
} from "./assessment.catalog.controller";
import { verifyJwt } from "../middleware/verifyJwt";

const catalogRoute = express.Router();

catalogRoute.get("/:gradeClass/subjects", verifyJwt, getSubjectsWithProgress);
catalogRoute.get("/:gradeClass/:subject/categories", verifyJwt, getCategoriesWithProgress);
catalogRoute.get("/:gradeClass/:subject/categories/:category/topics", verifyJwt, getTopicsWithProgress);
catalogRoute.get("/:gradeClass/:subject/insight", verifyJwt, getSubjectInsight);
catalogRoute.get("/:gradeClass/:subject/categories/:category/insight", verifyJwt, getSubjectInsight);

export default catalogRoute;
