const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://dabirax:wxGZGHjXKi36XTmo@learnexo01.z4pleac.mongodb.net/";

const CLASSES = ["jss1", "jss3", "ss1", "ss2", "ss3"];
const CATEGORIES = ["grammar", "comprehension", "vocabulary", "oral", "writing"];

const TOPIC_NAMES = {
  grammar: ["concord", "tenses", "articles", "prepositions", "sentence_structure"],
  comprehension: ["comprehension", "inference", "vocabulary_in_context", "summary", "reading_skills"],
  vocabulary: ["synonyms", "antonyms", "idioms", "word_formation", "spelling"],
  oral: ["vowel_sounds", "consonant_sounds", "stress", "intonation", "reading_skills"],
  writing: ["essay_writing", "letter_writing", "narrative_writing", "descriptive_writing", "summary"],
};

const QUESTION_BANK = {
  grammar: [
    { question: "She ___ to school every day.", options: [{ key: "a", text: "go" }, { key: "b", text: "goes" }, { key: "c", text: "going" }, { key: "d", text: "gone" }, { key: "e", text: "went" }], answer: "b", difficulty: "easy" },
    { question: "The boys ___ playing football in the field.", options: [{ key: "a", text: "is" }, { key: "b", text: "are" }, { key: "c", text: "was" }, { key: "d", text: "were" }, { key: "e", text: "be" }], answer: "b", difficulty: "easy" },
    { question: "Identify the adverb in the sentence: 'He spoke softly to the child.'", options: [{ key: "a", text: "spoke" }, { key: "b", text: "softly" }, { key: "c", text: "child" }, { key: "d", text: "He" }, { key: "e", text: "to" }], answer: "b", difficulty: "medium" },
    { question: "Which of the following is a conjunction?", options: [{ key: "a", text: "quickly" }, { key: "b", text: "beautiful" }, { key: "c", text: "because" }, { key: "d", text: "under" }, { key: "e", text: "they" }], answer: "c", difficulty: "medium" },
    { question: "Choose the correct pronoun: 'Between you and ___, this secret must not be told.'", options: [{ key: "a", text: "I" }, { key: "b", text: "me" }, { key: "c", text: "myself" }, { key: "d", text: "we" }, { key: "e", text: "us" }], answer: "b", difficulty: "hard" },
  ],
  comprehension: [
    { question: "What is the main idea of a passage?", options: [{ key: "a", text: "The longest sentence" }, { key: "b", text: "The central message or point" }, { key: "c", text: "The first paragraph only" }, { key: "d", text: "The author's name" }, { key: "e", text: "The title of the passage" }], answer: "b", difficulty: "easy" },
    { question: "Which reading strategy involves making educated guesses about what will happen next?", options: [{ key: "a", text: "Summarizing" }, { key: "b", text: "Predicting" }, { key: "c", text: "Skimming" }, { key: "d", text: "Memorizing" }, { key: "e", text: "Copying" }], answer: "b", difficulty: "easy" },
    { question: "When you infer, you are:", options: [{ key: "a", text: "Reading aloud" }, { key: "b", text: "Guessing randomly" }, { key: "c", text: "Drawing conclusions from evidence" }, { key: "d", text: "Skipping difficult words" }, { key: "e", text: "Writing a summary" }], answer: "c", difficulty: "medium" },
    { question: "What does 'context clues' help you do?", options: [{ key: "a", text: "Count the words" }, { key: "b", text: "Understand unfamiliar words" }, { key: "c", text: "Find the page number" }, { key: "d", text: "Identify the author" }, { key: "e", text: "Check the time" }], answer: "b", difficulty: "medium" },
    { question: "A good summary should include:", options: [{ key: "a", text: "Every single detail" }, { key: "b", text: "Only the first sentence" }, { key: "c", text: "The main points and key ideas" }, { key: "d", text: "The author's biography" }, { key: "e", text: "All the characters' names" }], answer: "c", difficulty: "hard" },
  ],
  vocabulary: [
    { question: "Choose the synonym of 'happy':", options: [{ key: "a", text: "sad" }, { key: "b", text: "joyful" }, { key: "c", text: "angry" }, { key: "d", text: "tired" }, { key: "e", text: "hungry" }], answer: "b", difficulty: "easy" },
    { question: "The antonym of 'brave' is:", options: [{ key: "a", text: "strong" }, { key: "b", text: "fearless" }, { key: "c", text: "cowardly" }, { key: "d", text: "bold" }, { key: "e", text: "heroic" }], answer: "c", difficulty: "easy" },
    { question: "What is the meaning of the idiom 'break a leg'?", options: [{ key: "a", text: "Actually break your leg" }, { key: "b", text: "Good luck" }, { key: "c", text: "Run fast" }, { key: "d", text: "Stop performing" }, { key: "e", text: "Be careful" }], answer: "b", difficulty: "medium" },
    { question: "Which word is formed by adding a prefix to 'do'?", options: [{ key: "a", text: "doing" }, { key: "b", text: "done" }, { key: "c", text: "undo" }, { key: "d", text: "did" }, { key: "e", text: "doer" }], answer: "c", difficulty: "medium" },
    { question: "The word 'photosynthesis' is formed from Greek roots meaning:", options: [{ key: "a", text: "light + sound" }, { key: "b", text: "light + putting together" }, { key: "c", text: "water + food" }, { key: "d", text: "air + growth" }, { key: "e", text: "sun + energy" }], answer: "b", difficulty: "hard" },
  ],
  oral: [
    { question: "How many vowel sounds are there in standard English?", options: [{ key: "a", text: "5" }, { key: "b", text: "10" }, { key: "c", text: "20" }, { key: "d", text: "26" }, { key: "e", text: "52" }], answer: "c", difficulty: "easy" },
    { question: "Which of these is a voiced consonant?", options: [{ key: "a", text: "p" }, { key: "b", text: "t" }, { key: "c", text: "k" }, { key: "d", text: "b" }, { key: "e", text: "f" }], answer: "d", difficulty: "easy" },
    { question: "In the word 'photograph', which syllable is stressed?", options: [{ key: "a", text: "pho-" }, { key: "b", text: "-to-" }, { key: "c", text: "-graph" }, { key: "d", text: "None" }, { key: "e", text: "All equally" }], answer: "a", difficulty: "medium" },
    { question: "Rising intonation at the end of a sentence usually indicates:", options: [{ key: "a", text: "A statement" }, { key: "b", text: "A command" }, { key: "c", text: "A question" }, { key: "d", text: "Anger" }, { key: "e", text: "Happiness" }], answer: "c", difficulty: "medium" },
    { question: "The diphthong /aɪ/ is found in which word?", options: [{ key: "a", text: "cat" }, { key: "b", text: "see" }, { key: "c", text: "boy" }, { key: "d", text: "my" }, { key: "e", text: "book" }], answer: "d", difficulty: "hard" },
  ],
  writing: [
    { question: "A formal letter to a government official should begin with:", options: [{ key: "a", text: "Hi there," }, { key: "b", text: "Dear Sir/Madam," }, { key: "c", text: "Hey you," }, { key: "d", text: "What's up," }, { key: "e", text: "Yo," }], answer: "b", difficulty: "easy" },
    { question: "Which of these is NOT a type of essay?", options: [{ key: "a", text: "Narrative" }, { key: "b", text: "Descriptive" }, { key: "c", text: "Argumentative" }, { key: "d", text: "Circular" }, { key: "e", text: "Expository" }], answer: "d", difficulty: "easy" },
    { question: "In a narrative essay, the sequence of events should be:", options: [{ key: "a", text: "Random" }, { key: "b", text: "Logical and chronological" }, { key: "c", text: "Alphabetical" }, { key: "d", text: "By length" }, { key: "e", text: "By color" }], answer: "b", difficulty: "medium" },
    { question: "Which element is essential in descriptive writing?", options: [{ key: "a", text: "Mathematical formulas" }, { key: "b", text: "Vivid sensory details" }, { key: "c", text: "Legal arguments" }, { key: "d", text: "Chemical equations" }, { key: "e", text: "Phone numbers" }], answer: "b", difficulty: "medium" },
    { question: "The conclusion of an essay should:", options: [{ key: "a", text: "Introduce new arguments" }, { key: "b", text: "Repeat every point verbatim" }, { key: "c", text: "Summarize key points and give final thoughts" }, { key: "d", text: "Be left blank" }, { key: "e", text: "List references only" }], answer: "c", difficulty: "hard" },
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const subjects = mongoose.connection.db.collection("subjects");
    const topics = mongoose.connection.db.collection("topics");
    const topicInstances = mongoose.connection.db.collection("topicinstances");
    const assessmentQuestions = mongoose.connection.db.collection("assessmentquestions");

    const english = await subjects.findOne({ name: "english" });
    if (!english) {
      console.error("English subject not found");
      process.exit(1);
    }
    const subjectId = english._id;

    // Build topic map
    const topicMap = new Map();
    for (const category of CATEGORIES) {
      const names = TOPIC_NAMES[category];
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        let topic = await topics.findOne({ name, subject: subjectId });
        if (!topic) {
          const result = await topics.insertOne({
            name,
            slug: name,
            subject: subjectId,
            category,
            description: `${name.replace(/_/g, " ")} for English Language`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          topic = { _id: result.insertedId, name, category };
          console.log(`Created topic: ${name} (${category})`);
        } else if (!topic.category) {
          await topics.updateOne({ _id: topic._id }, { $set: { category, updatedAt: new Date() } });
          console.log(`Updated topic category: ${name} → ${category}`);
        }
        topicMap.set(`${category}_${i}`, topic._id);
      }
    }

    for (const klass of CLASSES) {
      console.log(`Seeding ${klass.toUpperCase()}...`);
      let questionCounter = 1;

      for (const category of CATEGORIES) {
        const names = TOPIC_NAMES[category];
        const questionsForCategory = QUESTION_BANK[category];

        for (let i = 0; i < names.length; i++) {
          const topicId = topicMap.get(`${category}_${i}`);
          if (!topicId) continue;

          // Ensure topic instance
          let instance = await topicInstances.findOne({ topic: topicId, class: klass });
          if (!instance) {
            const result = await topicInstances.insertOne({
              topic: topicId,
              subject: subjectId,
              class: klass,
              difficultyLevel: i < 2 ? "beginner" : i < 4 ? "intermediate" : "advanced",
              order: i + 1,
              isCore: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            instance = { _id: result.insertedId };
          }

          const qData = questionsForCategory[i];
          const questionNumber = `ENG-${klass.toUpperCase()}-${String(questionCounter).padStart(3, "0")}`;

          const existing = await assessmentQuestions.findOne({ questionNumber });
          if (!existing) {
            await assessmentQuestions.insertOne({
              questionNumber,
              subject: subjectId,
              class: klass,
              topicInstanceId: instance._id,
              question: qData.question,
              options: qData.options,
              answer: qData.answer,
              difficulty: qData.difficulty,
              category,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }

          questionCounter++;
        }
      }

      const count = await assessmentQuestions.countDocuments({ subject: subjectId, class: klass });
      console.log(`✅ ${klass.toUpperCase()}: ${count} questions`);
    }

    console.log("🎉 Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
