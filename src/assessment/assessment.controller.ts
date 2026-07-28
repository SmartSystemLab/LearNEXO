import { RequestHandler, Request, Response } from "express";
import AssessmentQuestion from "./models/assessmentQuestion.model";
import mongoose from "mongoose";
import Assessment from "./models/assessment.model";
import TopicInstance from "./models/topicInstance.model";
import Topic from "./models/topic.model";
import UserTopicMastery from "./models/userTopicMastery.model"
import Subject from "./models/subject.model";
import { buildRecommendation, resolveSubject, computeAverageMastery, getTopicInstanceIdsFor } from "./assessment.helpers";
import { SUBJECT_CATALOG } from "./assessment.constants";
import Onboarding from "../auth/model/onboarding.model";
import RecommendedContent from "./models/recommendedContent.model";
import { bktUpdate, bktProbabilityToMastery, BKT_DEFAULTS } from "./bkt";
import axios from "axios";



const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

const VALID_AI_STYLES = new Set(["visual", "auditory", "kinesthetic"]);

function normalizeLearningStyle(style: string | null): string {
  const s = (style || "").toLowerCase().trim();
  return VALID_AI_STYLES.has(s) ? s : "visual";
}

function normalizeSubjectName(name: string): string {
  const n = name.toLowerCase().trim();
  if (n === "english" || n === "english language") return "English Language";
  if (n === "mathematics" || n === "maths" || n === "math") return "Mathematics";
  return name;
}

async function fetchAiContent(
  weakTopicSlugs: string[],
  subjectName: string,
  classLevel: string,
  learningStyle: string | null,
): Promise<Record<string, unknown> | null> {
  if (!weakTopicSlugs.length) return null;

  const topics = weakTopicSlugs.map((slug) => ({
    topic: slug,
    mastery: 0.2,
    learning_stage: "foundation",
  }));

  const payload = {
    mode: "multi_topic",
    topics,
    subject: normalizeSubjectName(subjectName),
    class_level: classLevel.toUpperCase(),
    learning_style: normalizeLearningStyle(learningStyle),
    content_depth: "core",
    focus_reason: "general_assessment",
  };

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/content`, payload, {
        timeout: 180000,
      });
      return response.data as Record<string, unknown>;
    } catch (err) {
      const axErr = err as any;
      const status = axErr?.response?.status;
      const body = axErr?.response?.data
        ? JSON.stringify(axErr.response.data).slice(0, 500)
        : "";
      console.error(
        `[AI Content] attempt ${attempt}/2 failed: ${axErr.message}${status ? ` status=${status}` : ""}${body ? ` body=${body}` : ""}`,
      );
    }
  }

  return null;
}

export const bulkUploadQuestions: RequestHandler = async (req, res) => {
  try {
    const questions = req.body;

    await AssessmentQuestion.insertMany(questions);

    res.status(201).json({
      message: "Assessment questions uploaded successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

function getDifficultyMix(classLevel: string, total: number): { easy: number; medium: number; hard: number } {
  const mixes: Record<string, [number, number, number]> = {
    jss1: [0.60, 0.30, 0.10],
    jss2: [0.50, 0.35, 0.15],
    jss3: [0.40, 0.40, 0.20],
    ss1: [0.30, 0.40, 0.30],
    ss2: [0.20, 0.40, 0.40],
    ss3: [0.15, 0.35, 0.50],
  };
  const [e, m, h] = mixes[classLevel.toLowerCase()] ?? [0.33, 0.33, 0.34];
  const easy = Math.round(total * e);
  const medium = Math.round(total * m);
  const hard = total - easy - medium;
  return { easy, medium, hard };
}

async function sampleQuestionsWithDifficulty(
  matchStage: Record<string, unknown>,
  total: number,
  classLevel: string,
): Promise<any[]> {
  const { easy, medium, hard } = getDifficultyMix(classLevel, total);

  const result = await AssessmentQuestion.aggregate([
    { $match: matchStage },
    {
      $facet: {
        easy: [
          { $match: { difficulty: "easy" } },
          { $sample: { size: easy } },
        ],
        medium: [
          { $match: { difficulty: "medium" } },
          { $sample: { size: medium } },
        ],
        hard: [
          { $match: { difficulty: "hard" } },
          { $sample: { size: hard } },
        ],
      },
    },
    {
      $project: {
        questions: {
          $concatArrays: ["$easy", "$medium", "$hard"],
        },
      },
    },
  ]);

  return result[0]?.questions || [];
}

export const getAssessmentQuestions: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { subject, gradeClass } = req.params as { subject: string; gradeClass: string };
    const categoryParam = (req.query.category as string)?.toLowerCase().trim();
    const topicParam = (req.query.topic as string)?.toLowerCase().trim();

    if (!subject || !gradeClass) {
      res.status(400).json({ message: "Missing params" });
      return;
    }

    const subjectDoc = await resolveSubject(subject);
    if (!subjectDoc) {
      res.status(404).json({ message: "Subject not found" });
      return;
    }

    const subjectId = subjectDoc._id as mongoose.Types.ObjectId;
    const userId = req.user?.id;

    console.log(`[getAssessmentQuestions] subject=${subject}, gradeClass=${gradeClass}, category=${categoryParam}, topic=${topicParam}`);

    let questions: any[] = [];
    let assessmentType: "initial" | "category" | "topic" = "initial";
    let topicInstanceIds: mongoose.Types.ObjectId[] = [];

    if (topicParam) {
      // Topic-level assessment: 15 questions from specific topic
      assessmentType = "topic";
      const topicDoc = await Topic.findOne({ slug: topicParam, subject: subjectId }).lean();
      if (!topicDoc) {
        res.status(404).json({ message: "Topic not found" });
        return;
      }

      const topicId = (topicDoc as any)._id as mongoose.Types.ObjectId;

      const instances = await TopicInstance.find({
        topic: topicId,
        subject: subjectId,
        class: gradeClass.toLowerCase(),
      }).lean();

      if (!instances.length) {
        res.status(404).json({ message: "No topic instances found for this class" });
        return;
      }

      const instanceIds = instances.map((i) => i._id);
      topicInstanceIds = instanceIds as mongoose.Types.ObjectId[];

      questions = await sampleQuestionsWithDifficulty(
        {
          subject: subjectId,
          class: gradeClass.toLowerCase(),
          topicInstanceId: { $in: instanceIds },
        },
        15,
        gradeClass,
      );
    } else if (categoryParam) {
      // Category-level assessment: 20 questions from specific category
      assessmentType = "category";
      questions = await sampleQuestionsWithDifficulty(
        {
          subject: subjectId,
          class: gradeClass.toLowerCase(),
          category: categoryParam,
        },
        20,
        gradeClass,
      );
    } else {
      // General/initial assessment: 5 questions per category (25 total)
      const categories = ["grammar", "comprehension", "vocabulary", "oral", "writing"];
      const result = await AssessmentQuestion.aggregate([
        {
          $match: {
            subject: subjectId,
            class: gradeClass.toLowerCase(),
            category: { $in: categories },
          },
        },
        {
          $facet: {
            grammar: [{ $match: { category: "grammar" } }, { $sample: { size: 5 } }],
            comprehension: [{ $match: { category: "comprehension" } }, { $sample: { size: 5 } }],
            vocabulary: [{ $match: { category: "vocabulary" } }, { $sample: { size: 5 } }],
            oral: [{ $match: { category: "oral" } }, { $sample: { size: 5 } }],
            writing: [{ $match: { category: "writing" } }, { $sample: { size: 5 } }],
          },
        },
        {
          $project: {
            questions: {
              $concatArrays: ["$grammar", "$comprehension", "$vocabulary", "$oral", "$writing"],
            },
          },
        },
      ]);
      questions = result[0]?.questions || [];
    }

    if (!questions.length) {
      res.status(404).json({ message: "No questions found" });
      return;
    }

    console.log(`[getAssessmentQuestions] fetched ${questions.length} questions`);
    console.log(`[getAssessmentQuestions] categories: ${questions.map((q: any) => q.category).join(", ")}`);
    console.log(`[getAssessmentQuestions] difficulties: ${questions.map((q: any) => q.difficulty).join(", ")}`);

    const questionIds = questions.map((q: any) => q._id);

    if (!topicInstanceIds.length) {
      topicInstanceIds = [
        ...new Map(
          questions.map((q: any) => [q.topicInstanceId.toString(), q.topicInstanceId]),
        ).values(),
      ];
    }

    const assessment = await Assessment.create({
      userId,
      subject: subjectId,
      class: gradeClass.toLowerCase(),
      type: assessmentType,
      topicInstances: topicInstanceIds,
      questions: questionIds,
      totalQuestions: questionIds.length,
      status: "in-progress",
      startedAt: new Date(),
      meta: {
        source: "system",
        difficultyMix: {
          easy: questions.filter((q: any) => q.difficulty === "easy").length,
          medium: questions.filter((q: any) => q.difficulty === "medium").length,
          hard: questions.filter((q: any) => q.difficulty === "hard").length,
        },
      },
    });

    res.status(200).json({
      assessmentId: assessment._id,
      total: questions.length,
      questions,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const getQuestionsByTopic: RequestHandler = async (req, res) => {
  try {
    const { subject, gradeClass, topic } = req.params;

    const questions = await AssessmentQuestion.find({
      subject,
      class: gradeClass,
      topic,
    });

    console.log("Found:", questions.length);

    res.status(200).json({
      total: questions.length,
      questions,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const getAllQuestions: RequestHandler = async (_req, res) => {
  try {
    const questions = await AssessmentQuestion.find().sort({
      questionNumber: 1,
    });
    const total = await AssessmentQuestion.countDocuments();

    res.status(200).json({
      total,
      questions,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const getQuestionById: RequestHandler = async (req, res) => {
  try {
    const { questionNumber } = req.params;

    const question = await AssessmentQuestion.findOne({ questionNumber });

    if (!question) {
      res.status(404).json({
        message: "Question not found",
      });
    }

    res.status(200).json({ question });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateQuestion: RequestHandler = async (req, res) => {
  try {
    const questionNumber = req.params.questionNumber;

    const updated = await AssessmentQuestion.findOneAndUpdate(
      { questionNumber },
      req.body,
      { new: true },
    );

    if (!updated) {
      res.status(404).json({
        message: "Question not found",
      });
    }

    res.status(200).json({
      message: "Question updated",
      updated,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const deleteQuestion: RequestHandler = async (req, res) => {
  try {
    const questionNumber = req.params.questionNumber;

    const deleted = await AssessmentQuestion.findOneAndDelete({
      questionNumber,
    });

    if (!deleted) {
      res.status(404).json({
        message: "Question not found",
      });
    }

    res.status(200).json({
      message: "Question deleted",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const getRecommendedContent: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;

    const recent = await RecommendedContent.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("subject", "name")
      .lean();

    const bySubject: Record<string, any[]> = {};
    const recentAll: any[] = [];

    recent.forEach((item: any) => {
      const subjectName = item.subject?.name ?? "Unknown";
      if (!bySubject[subjectName]) bySubject[subjectName] = [];
      bySubject[subjectName].push({
        id: item._id.toString(),
        title: item.title,
        description: item.description,
        type: item.type,
        url: item.url,
        coverImage: item.coverImage,
        topic: item.topic,
        category: item.category,
        priority: item.priority,
        createdAt: item.createdAt,
      });
      recentAll.push({
        id: item._id.toString(),
        title: item.title,
        description: item.description,
        type: item.type,
        url: item.url,
        coverImage: item.coverImage,
        topic: item.topic,
        category: item.category,
        priority: item.priority,
        createdAt: item.createdAt,
        subject: subjectName,
      });
    });

    res.status(200).json({
      recent: recentAll,
      bySubject,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getAssessmentHistory: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;

    const assessments = await Assessment.find({
      userId,
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .select("_id subject class type score completedAt topicInstances")
      .populate("subject", "name")
      .lean();

    const history = await Promise.all(
      assessments.map(async (a: any) => {
        const subjectName = a.subject?.name ?? "Unknown";
        let title = subjectName;
        let category = "";
        let topicName = "";

        // Populate topic instances to derive category/topic for the title
        if (a.topicInstances?.length) {
          const topicInstances = await TopicInstance.find({
            _id: { $in: a.topicInstances },
          })
            .populate("topic", "name category")
            .lean();

          if (topicInstances.length) {
            const firstTopic = (topicInstances[0] as any).topic;
            category = firstTopic?.category ?? "";
            topicName = firstTopic?.name ?? "";

            if (a.type === "category" && category) {
              title = `${subjectName} — ${category}`;
            } else if (a.type === "topic" && category && topicName) {
              title = `${subjectName} — ${category} — ${topicName}`;
            }
          }
        }

        return {
          assessmentId: a._id.toString(),
          subject: subjectName,
          class: a.class,
          type: a.type,
          score: a.score ?? 0,
          completedAt: a.completedAt,
          title,
          category,
          topic: topicName,
        };
      }),
    );

    res.status(200).json({ history });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

export const getAssessmentInsightById: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;
    const { assessmentId } = req.params;

    const assessment: any = await Assessment.findOne({
      _id: assessmentId,
      userId,
      status: "completed",
    }).lean();

    if (!assessment || !assessment.result) {
      res.status(404).json({ message: "Assessment not found or not completed" });
      return;
    }

    const subjectDoc = await Subject.findById(assessment.subject).select("name").lean();
    const scopeLabel = subjectDoc?.name ?? "this subject";

    const topicPerformance = assessment.result.topicPerformance || [];
    const weakIds = assessment.result.weakTopics || [];
    const strongIds = assessment.result.strongTopics || [];
    const score = assessment.score ?? 0;

    const topicInstanceIds = topicPerformance.map((tp: any) => tp.topicInstanceId);
    const topicInstances = await TopicInstance.find({ _id: { $in: topicInstanceIds } })
      .populate("topic", "name slug");

    const topicInfoMap = new Map<string, { name: string; slug: string }>();
    topicInstances.forEach((ti: any) => {
      topicInfoMap.set((ti._id as mongoose.Types.ObjectId).toString(), {
        name: ti.topic?.name ?? "Unknown",
        slug: ti.topic?.slug ?? "",
      });
    });

    const topicSummaries = topicPerformance.map((tp: any) => ({
      name: topicInfoMap.get(tp.topicInstanceId.toString())?.name ?? "Unknown",
      accuracy: tp.accuracy,
    }));

    const buildTopicList = async (ids: any[]) =>
      Promise.all(
        ids.map(async (id) => {
          const key = id.toString();
          const info = topicInfoMap.get(key);
          const tp = topicPerformance.find((t: any) => t.topicInstanceId.toString() === key);
          const mastery = await UserTopicMastery.findOne({
            userId,
            topicInstanceId: id,
          }).select("bktProbability").lean();
          return {
            topicInstanceId: key,
            name: info?.name ?? "Unknown",
            slug: info?.slug ?? "",
            accuracy: tp?.accuracy ?? 0,
            bktProbability: (mastery as any)?.bktProbability ?? 0.1,
          };
        }),
      );

    const weakTopics = await buildTopicList(weakIds);
    const strongTopics = await buildTopicList(strongIds);

    const { recommendedNextTopic, explanation, recommendations } = buildRecommendation(
      topicSummaries,
      weakTopics.map((t) => t.name),
      strongTopics.map((t) => t.name),
      scopeLabel,
    );

    res.status(200).json({
      hasInsight: true,
      assessmentId: assessment._id.toString(),
      completedAt: assessment.completedAt,
      score,
      weakTopics,
      strongTopics,
      recommendedNextTopic,
      explanation,
      recommendations,
      aiContent: assessment.aiContent ?? null,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getAssessmentCorrections: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;
    const { assessmentId } = req.params;

    const assessment: any = await Assessment.findOne({
      _id: assessmentId,
      userId,
      status: "completed",
    }).lean();

    if (!assessment) {
      res.status(404).json({ message: "Assessment not found" });
      return;
    }

    const submittedAnswers = assessment.submittedAnswers || [];

    // Collect all question IDs referenced in submittedAnswers (not just assessment.questions)
    const answerQuestionIds = submittedAnswers
      .map((ans: any) => ans.questionId)
      .filter(Boolean)
      .map((id: any) => id.toString());

    const questionIds = assessment.questions || [];
    const allIds = [...new Set([...questionIds.map((id: any) => id.toString()), ...answerQuestionIds])];

    const questions = await AssessmentQuestion.find({
      _id: { $in: allIds },
    }).lean();

    const questionMap = new Map<string, any>();
    questions.forEach((q: any) => {
      questionMap.set(q._id.toString(), q);
    });

    const corrections = await Promise.all(
      submittedAnswers.map(async (ans: any, index: number) => {
        const rawId = ans.questionId;
        const qid = rawId ? rawId.toString() : "";
        let question = questionMap.get(qid);

        // Fallback: query directly if not in map
        if (!question && qid) {
          question = await AssessmentQuestion.findById(qid).lean();
          if (question) questionMap.set(qid, question);
        }

        if (!question) {
          return {
            questionNumber: index + 1,
            question: "Question not found",
            userAnswer: ans.selected,
            correctAnswer: "",
            isCorrect: false,
            explanation: "",
          };
        }

        const isCorrect =
          question.answer?.toLowerCase().trim() === ans.selected?.toLowerCase().trim();

        return {
          questionNumber: index + 1,
          question: question.question,
          options: question.options,
          userAnswer: ans.selected,
          correctAnswer: question.answer,
          isCorrect,
          explanation: question.explanation || `Correct answer is ${question.answer?.toUpperCase()}.`,
        };
      }),
    );

    res.status(200).json({
      assessmentId,
      totalQuestions: questions.length,
      attempted: submittedAnswers.length,
      corrections,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getAnalytics: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;

    // 1. Class Mastery — current overall mastery per subject
    // Only average topic instances where the user actually has mastery data
    const classMastery: Record<string, number> = {};
    for (const entry of SUBJECT_CATALOG) {
      const subjectDoc = await Subject.findOne({ name: entry.name }).select("_id");
      if (!subjectDoc) {
        classMastery[entry.label] = 0;
        continue;
      }

      // Find all topic instances for this subject
      const allTopicInstances = await TopicInstance.find({
        subject: subjectDoc._id as mongoose.Types.ObjectId,
      }).select("_id");
      const allTopicInstanceIds = allTopicInstances.map((ti) => (ti._id as mongoose.Types.ObjectId).toString());

      // Find user's mastery records for those topic instances
      const masteryRows = await UserTopicMastery.find({
        userId,
        topicInstanceId: { $in: allTopicInstanceIds },
      }).select("masteryScore");

      const progress = masteryRows.length
        ? Math.round(masteryRows.reduce((sum, m) => sum + m.masteryScore, 0) / masteryRows.length)
        : 0;

      classMastery[entry.label] = progress;
    }

    // 2. Subject Progress Over Time — all completed assessments per subject
    const assessments = await Assessment.find({
      userId,
      status: "completed",
    })
      .sort({ completedAt: 1 })
      .select("subject class score completedAt result")
      .populate("subject", "name")
      .lean();

    const subjectProgress: Record<string, { date: string; score: number }[]> = {};
    assessments.forEach((a: any) => {
      const subjectName = a.subject?.name ?? "unknown";
      if (!subjectProgress[subjectName]) subjectProgress[subjectName] = [];
      subjectProgress[subjectName].push({
        date: a.completedAt ? new Date(a.completedAt).toISOString().split("T")[0] : "",
        score: a.score ?? 0,
      });
    });

    // 3. Topic Mastery Comparison — previous vs last assessment per topic
    // Get the last two assessments per subject
    const topicComparison: Record<
      string,
      { topic: string; previousMastery: number; currentMastery: number; bktProbability: number }[]
    > = {};

    const subjectIds = [...new Set(assessments.map((a: any) => a.subject?._id?.toString()).filter(Boolean))];

    // 4. Category Mastery — average mastery per topic category per subject
    const allUserMastery = await UserTopicMastery.find({ userId })
      .select("topicInstanceId bktProbability")
      .lean();
    const masteryByTi = new Map<string, number>(
      allUserMastery.map((m: any) => [
        m.topicInstanceId.toString(),
        m.bktProbability ?? 0.1,
      ]),
    );

    const categoryMastery: Record<string, { category: string; mastery: number }[]> = {};

    for (const subjectIdStr of subjectIds) {
      const subjectName =
        (assessments.find((a: any) => a.subject?._id?.toString() === subjectIdStr) as any)
          ?.subject?.name ?? "unknown";

      const tis = await TopicInstance.find({ subject: subjectIdStr })
        .populate("topic", "category")
        .lean();

      const byCategory = new Map<string, number[]>();
      for (const ti of tis) {
        const cat = (ti as any).topic?.category;
        if (!cat) continue;
        const prob = masteryByTi.get((ti._id as mongoose.Types.ObjectId).toString());
        if (prob === undefined) continue;
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        byCategory.get(cat)!.push(prob);
      }

      categoryMastery[subjectName] = [...byCategory.entries()].map(
        ([category, probs]) => ({
          category,
          mastery: Math.round(
            (probs.reduce((sum, p) => sum + p, 0) / probs.length) * 100,
          ),
        }),
      );
    }

    for (const subjectIdStr of subjectIds) {
      const subjectAssessments = assessments.filter(
        (a: any) => a.subject?._id?.toString() === subjectIdStr
      );
      if (subjectAssessments.length < 1) continue;

      const lastAssessment: any = subjectAssessments[subjectAssessments.length - 1];
      const previousAssessment: any =
        subjectAssessments.length > 1 ? subjectAssessments[subjectAssessments.length - 2] : null;

      const subjectName = lastAssessment.subject?.name ?? "unknown";
      topicComparison[subjectName] = [];

      const lastTopicPerf = lastAssessment.result?.topicPerformance || [];

      for (const tp of lastTopicPerf) {
        const topicInstance = await TopicInstance.findById(tp.topicInstanceId)
          .populate("topic", "name")
          .lean();
        if (!topicInstance) continue;

        const topicName = (topicInstance as any).topic?.name ?? "Unknown";

        let previousMastery = 0;
        if (previousAssessment) {
          const prevTp = previousAssessment.result?.topicPerformance?.find(
            (p: any) => p.topicInstanceId.toString() === tp.topicInstanceId.toString()
          );
          previousMastery = prevTp?.accuracy ?? 0;
        }

        // If no previous assessment, use the user's rolling mastery score
        // from UserTopicMastery as the baseline
        if (!previousAssessment || previousMastery === 0) {
          const masteryRecord = await UserTopicMastery.findOne({
            userId,
            topicInstanceId: tp.topicInstanceId,
          }).select("masteryScore").lean();
          previousMastery = (masteryRecord as any)?.masteryScore ?? 0;
        }

        topicComparison[subjectName].push({
          topic: topicName,
          previousMastery,
          currentMastery: tp.accuracy,
          bktProbability: (await UserTopicMastery.findOne({
            userId,
            topicInstanceId: tp.topicInstanceId,
          }).select("bktProbability").lean())?.bktProbability ?? 0.1,
        });
      }
    }

    res.status(200).json({
      classMastery,
      subjectProgress,
      topicComparison,
      categoryMastery,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getBktTraces: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;

    const assessments = await Assessment.find({
      userId,
      status: "completed",
      "result.topicPerformance.bktProbability": { $exists: true },
    })
      .sort({ completedAt: 1 })
      .select("subject completedAt result.topicPerformance")
      .populate("subject", "name")
      .lean();

    const topicInstanceIds = [
      ...new Set(
        assessments.flatMap((a: any) =>
          (a.result?.topicPerformance ?? [])
            .filter((tp: any) => tp.bktProbability !== undefined && tp.bktProbability !== null)
            .map((tp: any) => tp.topicInstanceId.toString()),
        ),
      ),
    ];

    const topicInstances = await TopicInstance.find({
      _id: { $in: topicInstanceIds },
    })
      .populate("topic", "name")
      .lean();

    const topicNameMap = new Map<string, string>();
    topicInstances.forEach((ti: any) => {
      topicNameMap.set(
        (ti._id as mongoose.Types.ObjectId).toString(),
        ti.topic?.name ?? "Unknown",
      );
    });

    const traces: Record<
      string,
      { topic: string; history: { date: string; mastery: number }[] }[]
    > = {};

    const bySubjectTopic = new Map<string, Map<string, { date: string; mastery: number }[]>>();

    for (const a of assessments as any[]) {
      const subjectName = a.subject?.name ?? "unknown";
      const date = a.completedAt
        ? new Date(a.completedAt).toISOString().split("T")[0]
        : "";

      for (const tp of a.result?.topicPerformance ?? []) {
        if (tp.bktProbability === undefined || tp.bktProbability === null) continue;

        const tiId = tp.topicInstanceId.toString();
        if (!bySubjectTopic.has(subjectName)) {
          bySubjectTopic.set(subjectName, new Map());
        }
        const subjectMap = bySubjectTopic.get(subjectName)!;
        if (!subjectMap.has(tiId)) {
          subjectMap.set(tiId, []);
        }
        subjectMap.get(tiId)!.push({
          date,
          mastery: Math.round(tp.bktProbability * 100),
        });
      }
    }

    for (const [subjectName, topicMap] of bySubjectTopic) {
      traces[subjectName] = [...topicMap.entries()].map(([tiId, history]) => ({
        topic: topicNameMap.get(tiId) ?? "Unknown",
        history,
      }));
    }

    res.status(200).json({ traces });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getAssessmentReport: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;
    const { assessmentId } = req.params;

    const assessment: any = await Assessment.findOne({
      _id: assessmentId,
      userId,
      status: "completed",
    }).lean();

    if (!assessment || !assessment.result) {
      res.status(404).json({ message: "Assessment not found or not completed" });
      return;
    }

    const subjectDoc = await Subject.findById(assessment.subject).select("name").lean();
    const scopeLabel = subjectDoc?.name ?? "this subject";

    const topicPerformance = assessment.result.topicPerformance || [];
    const weakIds = assessment.result.weakTopics || [];
    const strongIds = assessment.result.strongTopics || [];
    const score = assessment.score ?? 0;

    const topicInstanceIds = topicPerformance.map((tp: any) => tp.topicInstanceId);
    const topicInstances = await TopicInstance.find({ _id: { $in: topicInstanceIds } })
      .populate("topic", "name slug");

    const topicInfoMap = new Map<string, { name: string; slug: string }>();
    topicInstances.forEach((ti: any) => {
      topicInfoMap.set((ti._id as mongoose.Types.ObjectId).toString(), {
        name: ti.topic?.name ?? "Unknown",
        slug: ti.topic?.slug ?? "",
      });
    });

    const topicSummaries = topicPerformance.map((tp: any) => ({
      name: topicInfoMap.get(tp.topicInstanceId.toString())?.name ?? "Unknown",
      accuracy: tp.accuracy,
    }));

    const buildTopicList = async (ids: any[]) =>
      Promise.all(
        ids.map(async (id) => {
          const key = id.toString();
          const info = topicInfoMap.get(key);
          const tp = topicPerformance.find((t: any) => t.topicInstanceId.toString() === key);
          const mastery = await UserTopicMastery.findOne({
            userId,
            topicInstanceId: id,
          }).select("bktProbability").lean();
          return {
            topicInstanceId: key,
            name: info?.name ?? "Unknown",
            slug: info?.slug ?? "",
            accuracy: tp?.accuracy ?? 0,
            bktProbability: (mastery as any)?.bktProbability ?? 0.1,
          };
        }),
      );

    const weakTopics = await buildTopicList(weakIds);
    const strongTopics = await buildTopicList(strongIds);

    const { recommendedNextTopic, explanation, recommendations } = buildRecommendation(
      topicSummaries,
      weakTopics.map((t) => t.name),
      strongTopics.map((t) => t.name),
      scopeLabel,
    );

    const submittedAnswers = assessment.submittedAnswers || [];

    // Collect all question IDs referenced in submittedAnswers (not just assessment.questions)
    const answerQuestionIds = submittedAnswers
      .map((ans: any) => ans.questionId)
      .filter(Boolean)
      .map((id: any) => id.toString());

    const questionIds = assessment.questions || [];
    const allIds = [...new Set([...questionIds.map((id: any) => id.toString()), ...answerQuestionIds])];

    const questions = await AssessmentQuestion.find({
      _id: { $in: allIds },
    }).lean();

    const questionMap = new Map<string, any>();
    questions.forEach((q: any) => {
      questionMap.set(q._id.toString(), q);
    });

    const corrections = await Promise.all(
      submittedAnswers.map(async (ans: any, index: number) => {
        const rawId = ans.questionId;
        const qid = rawId ? rawId.toString() : "";
        let question = questionMap.get(qid);

        // Fallback: query directly if not in map
        if (!question && qid) {
          question = await AssessmentQuestion.findById(qid).lean();
          if (question) questionMap.set(qid, question);
        }

        if (!question) {
          return {
            questionNumber: index + 1,
            question: "Question not found",
            userAnswer: ans.selected,
            correctAnswer: "",
            isCorrect: false,
            explanation: "",
          };
        }

        const isCorrect =
          question.answer?.toLowerCase().trim() === ans.selected?.toLowerCase().trim();

        return {
          questionNumber: index + 1,
          question: question.question,
          options: question.options,
          userAnswer: ans.selected,
          correctAnswer: question.answer,
          isCorrect,
          explanation: question.explanation || `Correct answer is ${question.answer?.toUpperCase()}.`,
        };
      }),
    );

    res.status(200).json({
      assessmentId: assessment._id.toString(),
      completedAt: assessment.completedAt,
      subject: scopeLabel,
      class: assessment.class,
      score,
      weakTopics,
      strongTopics,
      recommendedNextTopic,
      explanation,
      recommendations,
      aiContent: assessment.aiContent ?? null,
      corrections,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const submitAssessment = async (req: Request, res: Response) => {
  try {

    const { assessmentId, answers } = req.body;

    if (!assessmentId || !answers?.length) {
      res.status(400).json({
        message: "Invalid payload",
      });
    }

    // Fetch assessment
    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      res.status(404).json({
        message: "Assessment not found",
      });
    }

    // Fetch questions
    const questions = await AssessmentQuestion.find({
      _id: { $in: assessment!.questions },
    });

    if (!questions.length) {
      res.status(404).json({
        message: "No questions found for this assessment",
      });
    }

    // Build lookup map
    let correctCount = 0;

    const questionMap = new Map();

    questions.forEach((q) => {
      questionMap.set(q._id!.toString(), q);
    });

    // Topic performance tracking
    const topicStats: Record<
      string,
      {
        total: number;
        correct: number;
        wrong: number;
      }
    > = {};

    for (const ans of answers) {
      const question = questionMap.get(ans.questionId);

      if (!question) continue;

      const topicId = question.topicInstanceId.toString();

      if (!topicStats[topicId]) {
        topicStats[topicId] = {
          total: 0,
          correct: 0,
          wrong: 0,
        };
      }

      topicStats[topicId].total++;

      if (
        question.answer.toLowerCase().trim() ===
        ans.selected.toLowerCase().trim()
      ) {
  correctCount++;
        topicStats[topicId].correct++;
      } else {
        topicStats[topicId].wrong++;
      }
    }


    const topicDocs = await TopicInstance.find({
      _id: { $in: Object.keys(topicStats) },
    }).populate("topic", "name slug description");


    //Strong and weak topics
const weakTopics: any[] = [];
const strongTopics: any[] = [];
const topicBreakdown: any[] = [];

for (const topic of topicDocs) {
  const stat = topicStats[(topic._id as string).toString()];

  const accuracy = Math.round((stat.correct / stat.total) * 100);

  const breakdown = {
    topicInstanceId: topic._id,

    topic: {
      id: topic.topic?._id,
      name: topic.topic?.name,
      slug: topic.topic?.slug,
    },

    difficultyLevel: topic.difficultyLevel,
    order: topic.order,
    isCore: topic.isCore,

    performance: {
      total: stat.total,
      correct: stat.correct,
      wrong: stat.wrong,
      accuracy,
    },
  };

  topicBreakdown.push(breakdown);

  if (accuracy < 60) {
    weakTopics.push(breakdown);
  }

  if (accuracy >= 80) {
    strongTopics.push(breakdown);
  }
}
    
    const totalQuestions = questions.length;
    const attempted = answers.length;
    const wrongCount = attempted - correctCount;
    const unanswered = totalQuestions - attempted;

    const scorePercent = Math.round((correctCount / totalQuestions) * 100);

    //Update assessment

    assessment!.score = scorePercent;

    assessment!.submittedAnswers = answers.map((a: any) => ({
      questionId: a.questionId,
      selected: a.selected,
      isCorrect: questionMap.get(a.questionId)?.answer === a.selected,
    }));

    assessment!.result = {
      attempted,
      correct: correctCount,
      wrong: wrongCount,
      unanswered,

      topicPerformance: topicBreakdown.map((t: any) => ({
        topicInstanceId: t.topicInstanceId,
        accuracy: t.performance.accuracy,
        total: t.performance.total,
        correct: t.performance.correct,
        wrong: t.performance.wrong,
      })),

      weakTopics: weakTopics.map((t: any) => t.topicInstanceId),

      strongTopics: strongTopics.map((t: any) => t.topicInstanceId),
    };

    assessment!.status = "completed";
    assessment!.completedAt = new Date();

    await assessment!.save();

    // Update user topic mastery using Bayesian Knowledge Tracing

    const userId = assessment!.userId;

    const questionTopicMap = new Map<string, string>();
    questions.forEach((q) => {
      questionTopicMap.set(q._id!.toString(), q.topicInstanceId.toString());
    });

    const topicAnswers = new Map<string, boolean[]>();
    for (const ans of answers) {
      const topicId = questionTopicMap.get(ans.questionId);
      if (!topicId) continue;
      if (!topicAnswers.has(topicId)) {
        topicAnswers.set(topicId, []);
      }
      topicAnswers.get(topicId)!.push(
        questionMap.get(ans.questionId)?.answer.toLowerCase().trim() ===
          ans.selected.toLowerCase().trim(),
      );
    }

    const bktByTopic = new Map<string, number>();

    for (const topic of topicBreakdown) {
      const accuracy = topic.performance.accuracy;
      const answerSequence = topicAnswers.get(topic.topicInstanceId.toString()) || [];

      const existingMastery = await UserTopicMastery.findOne({
        userId,
        topicInstanceId: topic.topicInstanceId,
      });

      let prior = BKT_DEFAULTS.P_L0;
      if (existingMastery) {
        prior = existingMastery.bktProbability;
      }

      for (const isCorrect of answerSequence) {
        prior = bktUpdate(prior, isCorrect);
      }

      const bktProb = prior;
      const masteryScore = bktProbabilityToMastery(bktProb);
      bktByTopic.set(topic.topicInstanceId.toString(), bktProb);

      if (!existingMastery) {
        await UserTopicMastery.create({
          userId,
          topicInstanceId: topic.topicInstanceId,

          masteryScore,
          bktProbability: bktProb,
          attempts: 1,

          lastAccuracy: accuracy,

          weakStreak: accuracy < 60 ? 1 : 0,
          strongStreak: accuracy >= 80 ? 1 : 0,

          status:
            accuracy >= 80 ? "mastered" : accuracy < 60 ? "weak" : "improving",

          lastAssessedAt: new Date(),
        });

        continue;
      }

      existingMastery.bktProbability = bktProb;
      existingMastery.masteryScore = masteryScore;

      existingMastery.attempts += 1;

      existingMastery.lastAccuracy = accuracy;

      if (accuracy < 60) {
        existingMastery.weakStreak += 1;
        existingMastery.strongStreak = 0;
      }

      if (accuracy >= 80) {
        existingMastery.strongStreak += 1;
        existingMastery.weakStreak = 0;
      }

      if (
        existingMastery.strongStreak >= 3 ||
        existingMastery.masteryScore >= 85
      ) {
        existingMastery.status = "mastered";
      } else if (existingMastery.weakStreak >= 2 || accuracy < 60) {
        existingMastery.status = "weak";
      } else {
        existingMastery.status = "improving";
      }

      existingMastery.lastAssessedAt = new Date();

      await existingMastery.save();
    }

    if (assessment!.result?.topicPerformance) {
      for (const tp of assessment!.result.topicPerformance) {
        const prob = bktByTopic.get(tp.topicInstanceId.toString());
        if (prob !== undefined) {
          tp.bktProbability = prob;
        }
      }
    }

    const userTopicMastery = await UserTopicMastery.find({
      userId,
    });

    // Overall SubjectClass Mastery
const allTopics = await TopicInstance.find({
  subject: assessment!.subject,
  class: assessment!.class,
});

const masteryRows = await UserTopicMastery.find({
  userId,
  topicInstanceId: {
    $in: allTopics.map((t) => t._id),
  },
});

const masteryMap = new Map();

masteryRows.forEach((m) => {
  masteryMap.set(m.topicInstanceId.toString(), m.masteryScore);
});

let totalMastery = 0;

for (const topic of allTopics) {
  totalMastery += masteryMap.get(topic._id.toString()) || 0;
}

const subjectMastery = Math.round(totalMastery / allTopics.length);

    // Recommendations + insight (shared with /catalog/.../insight endpoints)
    const subjectDoc = await Subject.findById(assessment!.subject).select("name").lean();

    const { recommendedNextTopic, explanation, recommendations } = buildRecommendation(
      topicBreakdown.map((t: any) => ({ name: t.topic.name, accuracy: t.performance.accuracy })),
      weakTopics.map((t: any) => t.topic.name),
      strongTopics.map((t: any) => t.topic.name),
      subjectDoc?.name ?? "this subject",
    );

    const toInsightTopic = (t: any) => ({
      topicInstanceId: t.topicInstanceId,
      name: t.topic.name,
      slug: t.topic.slug,
      accuracy: t.performance.accuracy,
    });

    await assessment!.save();

    // Fire AI content generation in the background so the submit response isn't blocked.
    // The AI service can take 30s+ (cold start + sequential per-topic generation);
    // content is persisted to the assessment + RecommendedContent when it arrives.
    const assessmentObjectId = assessment!._id as mongoose.Types.ObjectId;
    const subjectId = assessment!.subject;
    const weakSlugs = weakTopics.map((t: any) => t.topic.slug);
    const classLevel = assessment!.class;
    const subjectName = subjectDoc?.name ?? "English Language";

    void (async () => {
      try {
        const onboardingProfile = await Onboarding.findOne({ userId }).lean();
        const learningStyle = (onboardingProfile as any)?.learningProfile?.learningStyle ?? null;

        const aiContent = await fetchAiContent(
          weakSlugs,
          subjectName,
          classLevel,
          learningStyle,
        );

        const generatedContent = (aiContent?.generated_content as any[]) ?? null;
        if (!generatedContent || !Array.isArray(generatedContent)) return;

        await Assessment.findByIdAndUpdate(assessmentObjectId, {
          $set: { aiContent: generatedContent },
        });

        for (const item of generatedContent) {
          const topicName = item.topic ?? "general";
          const topicDoc = await Topic.findOne({ slug: topicName, subject: subjectId }).lean();
          const category = (topicDoc as any)?.category ?? "general";

          const resources = item.resources ?? {};
          const videos = resources.videos ?? [];
          const materials = resources.materials ?? [];

          for (const video of videos) {
            await RecommendedContent.findOneAndUpdate(
              {
                userId,
                assessmentId: assessmentObjectId,
                title: video.title,
                type: "video",
              },
              {
                userId,
                assessmentId: assessmentObjectId,
                subject: subjectId,
                topic: topicName,
                category,
                title: video.title,
                description: item.explanation?.summary ?? "",
                type: "video",
                url: video.url,
                source: "ai",
                priority: item.priority ?? 0,
              },
              { upsert: true, new: true },
            );
          }

          for (const material of materials) {
            await RecommendedContent.findOneAndUpdate(
              {
                userId,
                assessmentId: assessmentObjectId,
                title: material.title,
                type: "text",
              },
              {
                userId,
                assessmentId: assessmentObjectId,
                subject: subjectId,
                topic: topicName,
                category,
                title: material.title,
                description: item.explanation?.summary ?? "",
                type: "text",
                url: material.url,
                source: "ai",
                priority: item.priority ?? 0,
              },
              { upsert: true, new: true },
            );
          }
        }
      } catch (err) {
        console.error("[AI Content] Background generation failed:", err);
      }
    })();

    //Response
    res.status(200).json({
      message: "Assessment graded",
      assessment, userTopicMastery, subjectMastery,
      recommendations,
      insight: {
        score: scorePercent,
        weakTopics: weakTopics.map(toInsightTopic),
        strongTopics: strongTopics.map(toInsightTopic),
        recommendedNextTopic,
        explanation,
      },
      aiContent: null,
    });
  } catch (error) {
    console.error(error);

     res.status(500).json({
      message: "Server error",
    });
  }
};