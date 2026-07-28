import mongoose from "mongoose";
import mongooseConnection from "../../connections/database.connection";
import Logging from "../../middleware/logging";
import Assessment from "../models/assessment.model";
import AssessmentQuestion from "../models/assessmentQuestion.model";
import UserTopicMastery from "../models/userTopicMastery.model";
import { bktUpdate, bktProbabilityToMastery, BKT_DEFAULTS } from "../bkt";

(async () => {
  try {
    await mongooseConnection();

    const assessments = await Assessment.find({ status: "completed" })
      .select("userId questions submittedAnswers")
      .sort({ completedAt: 1 })
      .lean();

    Logging.info(`Processing ${assessments.length} completed assessments for BKT backfill`);

    const questionIds = [
      ...new Set(
        assessments.flatMap((a) =>
          (a.questions ?? []).map((id) => id.toString()),
        ),
      ),
    ];

    const questions = await AssessmentQuestion.find({
      _id: { $in: questionIds },
    }).lean();

    const questionMap = new Map<string, { topicInstanceId: string; answer: string }>();
    questions.forEach((q) => {
      questionMap.set(q._id.toString(), {
        topicInstanceId: q.topicInstanceId.toString(),
        answer: q.answer,
      });
    });

    let usersProcessed = 0;

    for (const assessment of assessments) {
      const userId = assessment.userId.toString();
      const answers = assessment.submittedAnswers ?? [];
      if (!answers.length) continue;

      const topicAnswers = new Map<string, boolean[]>();

      for (const ans of answers) {
        const qid = ans.questionId?.toString();
        if (!qid) continue;
        const qInfo = questionMap.get(qid);
        if (!qInfo) continue;

        const topicId = qInfo.topicInstanceId;
        if (!topicAnswers.has(topicId)) {
          topicAnswers.set(topicId, []);
        }
        topicAnswers
          .get(topicId)!
          .push(
            qInfo.answer.toLowerCase().trim() ===
              ans.selected.toLowerCase().trim(),
          );
      }

      for (const [topicInstanceId, sequence] of topicAnswers) {
        const existing = await UserTopicMastery.findOne({
          userId,
          topicInstanceId,
        });

        let prior = existing?.bktProbability ?? BKT_DEFAULTS.P_L0;

        for (const isCorrect of sequence) {
          prior = bktUpdate(prior, isCorrect);
        }

        const masteryScore = bktProbabilityToMastery(prior);

        if (existing) {
          existing.bktProbability = prior;
          existing.masteryScore = masteryScore;
          await existing.save();
        } else {
          await UserTopicMastery.create({
            userId,
            topicInstanceId,
            masteryScore,
            bktProbability: prior,
            attempts: 1,
            lastAssessedAt: new Date(),
          });
        }

        await Assessment.updateOne(
          {
            _id: assessment._id,
            "result.topicPerformance.topicInstanceId": new mongoose.Types.ObjectId(
              topicInstanceId,
            ),
          },
          {
            $set: {
              "result.topicPerformance.$.bktProbability": prior,
            },
          },
        );
      }

      usersProcessed++;
    }

    Logging.info(`BKT backfill complete. ${usersProcessed} assessments replayed.`);
    process.exit(0);
  } catch (error) {
    Logging.error("BKT backfill failed: " + error);
    process.exit(1);
  }
})();
