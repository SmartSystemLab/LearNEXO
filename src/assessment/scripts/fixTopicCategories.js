const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://dabirax:wxGZGHjXKi36XTmo@learnexo01.z4pleac.mongodb.net/";

// Fix: reading_skills appears in both comprehension and oral.
// We need to create a separate topic for oral's reading_skills
// and update the topic instances that belong to oral to point to the new topic.

async function fixTopics() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const subjects = mongoose.connection.db.collection("subjects");
    const topics = mongoose.connection.db.collection("topics");
    const topicInstances = mongoose.connection.db.collection("topicinstances");

    const english = await subjects.findOne({ name: "english" });
    if (!english) {
      console.log("English subject not found");
      process.exit(1);
    }
    const subjectId = english._id;

    // 1. Find the existing reading_skills topic
    const existingReadingSkills = await topics.findOne({
      name: "reading_skills",
      subject: subjectId,
    });

    if (!existingReadingSkills) {
      console.log("No reading_skills topic found");
      process.exit(0);
    }

    console.log(`Found reading_skills topic: ${existingReadingSkills._id} with category: ${existingReadingSkills.category}`);

    // 2. Create a new topic for oral's reading_skills if it doesn't exist
    let oralReadingSkills = await topics.findOne({
      name: "oral_reading_skills",
      subject: subjectId,
    });

    if (!oralReadingSkills) {
      const result = await topics.insertOne({
        name: "oral_reading_skills",
        slug: "oral_reading_skills",
        subject: subjectId,
        category: "oral",
        description: "reading skills for Oral English",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      oralReadingSkills = { _id: result.insertedId };
      console.log(`Created oral_reading_skills topic: ${result.insertedId}`);
    } else {
      console.log(`oral_reading_skills already exists: ${oralReadingSkills._id}`);
    }

    // 3. Find topic instances that belong to oral's reading_skills
    // We determine this by checking which topic instances have "oral" in their
    // associated questions' category, or by the order in which they were created.
    // Simpler approach: update topic instances where the original topic is reading_skills
    // AND the topic instance's class has oral-related questions.
    // Actually, let's just look at assessment questions to find which topic instances
    // are associated with oral category questions.

    const assessmentQuestions = mongoose.connection.db.collection("assessmentquestions");
    const oralQuestions = await assessmentQuestions.find({
      subject: subjectId,
      category: "oral",
    }).toArray();

    const oralTopicInstanceIds = new Set();
    oralQuestions.forEach((q) => {
      if (q.topicInstanceId) {
        oralTopicInstanceIds.add(q.topicInstanceId.toString());
      }
    });

    console.log(`Found ${oralTopicInstanceIds.size} oral topic instance IDs from questions`);

    // 4. Update those topic instances to point to the new oral_reading_skills topic
    let updatedCount = 0;
    for (const tiId of oralTopicInstanceIds) {
      const ti = await topicInstances.findOne({ _id: new mongoose.Types.ObjectId(tiId) });
      if (ti && ti.topic.toString() === existingReadingSkills._id.toString()) {
        await topicInstances.updateOne(
          { _id: ti._id },
          { $set: { topic: oralReadingSkills._id, updatedAt: new Date() } }
        );
        updatedCount++;
        console.log(`Updated topic instance ${tiId} → oral_reading_skills`);
      }
    }

    console.log(`\nUpdated ${updatedCount} topic instances`);

    // 5. Also fix any other topics that might be miscategorized
    // Ensure all topics have the correct category from TOPIC_NAMES
    const TOPIC_NAMES = {
      grammar: ["concord", "tenses", "articles", "prepositions", "sentence_structure"],
      comprehension: ["comprehension", "inference", "vocabulary_in_context", "summary", "reading_skills"],
      vocabulary: ["synonyms", "antonyms", "idioms", "word_formation", "spelling"],
      oral: ["vowel_sounds", "consonant_sounds", "stress", "intonation", "oral_reading_skills"],
      writing: ["essay_writing", "letter_writing", "narrative_writing", "descriptive_writing", "summary"],
    };

    for (const [category, names] of Object.entries(TOPIC_NAMES)) {
      for (const name of names) {
        const topic = await topics.findOne({ name, subject: subjectId });
        if (topic && topic.category !== category) {
          await topics.updateOne(
            { _id: topic._id },
            { $set: { category, updatedAt: new Date() } }
          );
          console.log(`Fixed topic ${name}: ${topic.category} → ${category}`);
        }
      }
    }

    console.log("\nTopic fix complete!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Fix failed:", err);
    process.exit(1);
  }
}

fixTopics();
