const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://dabirax:wxGZGHjXKi36XTmo@learnexo01.z4pleac.mongodb.net/";

async function cleanup() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const assessmentQuestions = mongoose.connection.db.collection("assessmentquestions");

    // Pattern: [SOMETHING] Choose the correct answer.
    const placeholderRegex = /^\[.*\]\s*Choose the correct answer\.?$/i;

    // Count first
    const count = await assessmentQuestions.countDocuments({
      question: { $regex: placeholderRegex },
    });
    console.log(`Found ${count} placeholder questions to delete`);

    if (count === 0) {
      console.log("No placeholder questions found.");
      await mongoose.disconnect();
      return;
    }

    const result = await assessmentQuestions.deleteMany({
      question: { $regex: placeholderRegex },
    });

    console.log(`Deleted ${result.deletedCount} placeholder questions`);
    await mongoose.disconnect();
    console.log("Cleanup complete");
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
}

cleanup();
