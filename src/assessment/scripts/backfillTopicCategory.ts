// One-off backfill: derive each Topic's `category` from the categories of the
// AssessmentQuestions that reference it (via TopicInstance), picking the most
// common category per topic.
//
// Run with: npx ts-node src/assessment/scripts/backfillTopicCategory.ts
import mongoose from "mongoose";
import mongooseConnection from "../../connections/database.connection";
import Logging from "../../middleware/logging";
import Topic from "../models/topic.model";
import AssessmentQuestion from "../models/assessmentQuestion.model";

(async () => {
  try {
    await mongooseConnection();

    const grouped = await AssessmentQuestion.aggregate([
      {
        $lookup: {
          from: "topicinstances",
          localField: "topicInstanceId",
          foreignField: "_id",
          as: "topicInstance",
        },
      },
      { $unwind: "$topicInstance" },
      {
        $group: {
          _id: { topic: "$topicInstance.topic", category: "$category" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.topic": 1, count: -1 } },
    ]);

    // First entry per topic (after the sort above) is the highest-count category.
    const categoryByTopic = new Map<string, string>();
    for (const row of grouped) {
      const topicId = row._id.topic.toString();
      if (!categoryByTopic.has(topicId)) {
        categoryByTopic.set(topicId, row._id.category);
      }
    }

    const topics = await Topic.find().select("_id name");

    let updated = 0;
    const uncategorized: string[] = [];

    for (const topic of topics) {
      const category = categoryByTopic.get((topic._id as mongoose.Types.ObjectId).toString());

      if (!category) {
        uncategorized.push(topic.name);
        continue;
      }

      await Topic.updateOne({ _id: topic._id }, { $set: { category } });
      updated++;
    }

    if (uncategorized.length) {
      Logging.warn(
        `Left uncategorized (no matching questions): ${uncategorized.join(", ")}`,
      );
    }

    Logging.info(`✅ ${updated}/${topics.length} topics updated with a category`);
    process.exit(0);
  } catch (error) {
    Logging.error("Backfill failed: " + error);
    process.exit(1);
  }
})();
