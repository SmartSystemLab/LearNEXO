const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://dabirax:wxGZGHjXKi36XTmo@learnexo01.z4pleac.mongodb.net/";

async function cleanupAll() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const assessmentQuestions = mongoose.connection.db.collection("assessmentquestions");
    const subjects = mongoose.connection.db.collection("subjects");

    const english = await subjects.findOne({ name: "english" });
    if (!english) {
      console.log("English subject not found");
      await mongoose.disconnect();
      return;
    }

    const result = await assessmentQuestions.deleteMany({ subject: english._id });
    console.log(`Deleted ${result.deletedCount} English assessment questions`);

    await mongoose.disconnect();
    console.log("Cleanup complete");
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
}

cleanupAll();
