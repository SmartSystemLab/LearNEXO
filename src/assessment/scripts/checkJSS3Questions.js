const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://dabirax:wxGZGHjXKi36XTmo@learnexo01.z4pleac.mongodb.net/";

async function checkQuestions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB\n");

    const assessmentQuestions = mongoose.connection.db.collection("assessmentquestions");
    const subjects = mongoose.connection.db.collection("subjects");

    const english = await subjects.findOne({ name: "english" });
    if (!english) {
      console.log("English subject not found");
      await mongoose.disconnect();
      return;
    }

    // Check JSS3 comprehension questions
    const jss3Questions = await assessmentQuestions
      .find({ subject: english._id, class: "jss3", category: "comprehension" })
      .limit(5)
      .toArray();

    console.log("=== JSS3 Comprehension Questions Sample ===");
    jss3Questions.forEach((q, i) => {
      console.log(`\n${i + 1}. [${q.difficulty}] ${q.question}`);
      q.options.forEach((opt) => console.log(`   ${opt.key}. ${opt.text}`));
      console.log(`   Answer: ${q.answer}`);
    });

    // Count by class
    const counts = await assessmentQuestions.aggregate([
      { $match: { subject: english._id } },
      { $group: { _id: "$class", count: { $sum: 1 } } },
    ]).toArray();

    console.log("\n=== Question Counts by Class ===");
    counts.forEach((c) => console.log(`${c._id}: ${c.count}`));

    await mongoose.disconnect();
  } catch (err) {
    console.error("Check failed:", err);
    process.exit(1);
  }
}

checkQuestions();
