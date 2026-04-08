"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const learning_style_controller_1 = require("./learning-style.controller");
const router = (0, express_1.Router)();
router.get("/questions", learning_style_controller_1.getLearningStyleQuestions);
router.post("/submit", learning_style_controller_1.submitLearningStyle);
exports.default = router;
//# sourceMappingURL=learning-style.routes.js.map