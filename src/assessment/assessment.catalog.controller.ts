import { RequestHandler } from "express";
import { Types } from "mongoose";
import Subject from "./models/subject.model";
import Topic from "./models/topic.model";
import TopicInstance from "./models/topicInstance.model";
import Assessment from "./models/assessment.model";
import { SUBJECT_CATALOG, normalizeClass } from "./assessment.constants";
import {
  resolveSubject,
  computeAverageMastery,
  getTopicInstanceIdsFor,
  humanizeLabel,
  buildRecommendation,
} from "./assessment.helpers";

export const getSubjectsWithProgress: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;
    const { gradeClass } = req.params as { gradeClass: string };
    const klass = normalizeClass(gradeClass);

    const subjects = await Promise.all(
      SUBJECT_CATALOG.map(async (entry) => {
        const subjectDoc = await Subject.findOne({ name: entry.name }).select("_id");

        if (!subjectDoc) {
          return {
            id: null,
            name: entry.name,
            code: entry.code,
            label: entry.label,
            progress: 0,
            hasData: false,
          };
        }

        const subjectId = subjectDoc._id as Types.ObjectId;
        const { topicInstanceIds } = await getTopicInstanceIdsFor(subjectId, klass);
        const progress = await computeAverageMastery(userId, topicInstanceIds);

        return {
          id: subjectId.toString(),
          name: entry.name,
          code: entry.code,
          label: entry.label,
          progress,
          hasData: topicInstanceIds.length > 0,
        };
      }),
    );

    res.status(200).json({ class: klass, subjects });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getCategoriesWithProgress: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;
    const { gradeClass, subject: subjectParam } = req.params as { gradeClass: string; subject: string };
    const klass = normalizeClass(gradeClass);

    const subject = await resolveSubject(subjectParam);
    if (!subject) {
      res.status(404).json({ message: "Subject not found" });
      return;
    }

    const subjectId = subject._id as Types.ObjectId;
    const catalogEntry = SUBJECT_CATALOG.find((s) => s.name === subject.name);

    const categoryNames: string[] = await Topic.distinct("category", {
      subject: subjectId,
      category: { $ne: null },
    });

    const categories = await Promise.all(
      categoryNames.map(async (category) => {
        const { topicInstanceIds, topicIds } = await getTopicInstanceIdsFor(
          subjectId,
          klass,
          category,
        );
        const progress = await computeAverageMastery(userId, topicInstanceIds);

        return {
          category,
          label: humanizeLabel(category),
          progress,
          topicCount: topicIds.length,
          hasData: topicInstanceIds.length > 0,
        };
      }),
    );

    res.status(200).json({
      class: klass,
      subject: {
        id: subjectId.toString(),
        name: subject.name,
        label: catalogEntry?.label ?? subject.name,
        code: subject.code,
      },
      categories,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getTopicsWithProgress: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;
    const { gradeClass, subject: subjectParam, category: categoryParam } = req.params as {
      gradeClass: string;
      subject: string;
      category: string;
    };
    const klass = normalizeClass(gradeClass);
    const category = categoryParam.toLowerCase().trim();

    const subject = await resolveSubject(subjectParam);
    if (!subject) {
      res.status(404).json({ message: "Subject not found" });
      return;
    }

    const subjectId = subject._id as Types.ObjectId;

    const categoryExists = await Topic.exists({ subject: subjectId, category });
    if (!categoryExists) {
      res.status(404).json({ message: "Category not found for this subject" });
      return;
    }

    const topics = await Topic.find({ subject: subjectId, category });

    const topicsWithProgress = await Promise.all(
      topics.map(async (topic) => {
        const topicId = topic._id as Types.ObjectId;

        const instances = await TopicInstance.find({
          topic: topicId,
          class: klass,
        }).select("_id");

        const topicInstanceIds = instances.map((i) => i._id as Types.ObjectId);
        const progress = await computeAverageMastery(userId, topicInstanceIds);

        return {
          id: topicId.toString(),
          name: topic.name,
          slug: topic.slug,
          description: topic.description,
          progress,
          instanceCount: topicInstanceIds.length,
          hasData: topicInstanceIds.length > 0,
        };
      }),
    );

    res.status(200).json({
      class: klass,
      subject: { id: subjectId.toString(), name: subject.name },
      category,
      label: humanizeLabel(category),
      topics: topicsWithProgress,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getSubjectInsight: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;
    const { gradeClass, subject: subjectParam, category: categoryRouteParam } = req.params as {
      gradeClass: string;
      subject: string;
      category?: string;
    };
    const klass = normalizeClass(gradeClass);
    const categoryParam = categoryRouteParam
      ? categoryRouteParam.toLowerCase().trim()
      : undefined;

    const subject = await resolveSubject(subjectParam);
    if (!subject) {
      res.status(404).json({ message: "Subject not found" });
      return;
    }

    const subjectId = subject._id as Types.ObjectId;

    if (categoryParam) {
      const categoryExists = await Topic.exists({ subject: subjectId, category: categoryParam });
      if (!categoryExists) {
        res.status(404).json({ message: "Category not found for this subject" });
        return;
      }
    }

    // Find the latest assessment. If a category is requested, find the latest
    // assessment whose topic instances belong to that category.
    let assessment: any;
    if (categoryParam) {
      const { topicInstanceIds: categoryInstanceIds } = await getTopicInstanceIdsFor(
        subjectId,
        klass,
        categoryParam,
      );
      const categoryInstanceIdSet = new Set(categoryInstanceIds.map((id) => id.toString()));

      // Get all completed assessments for this subject+class, newest first
      const subjectAssessments = await Assessment.find({
        userId,
        subject: subjectId,
        class: klass,
        status: "completed",
      })
        .sort({ completedAt: -1 })
        .lean();

      // Find the first assessment that has at least one topic instance in this category
      assessment = subjectAssessments.find((a: any) => {
        const instanceIds = a.topicInstances || [];
        return instanceIds.some((id: any) => categoryInstanceIdSet.has(id.toString()));
      });
    } else {
      assessment = await Assessment.findOne({
        userId,
        subject: subjectId,
        class: klass,
        status: "completed",
      })
        .sort({ completedAt: -1 })
        .lean();
    }

    if (!assessment || !assessment.result) {
      res.status(200).json({ hasInsight: false });
      return;
    }

    let topicPerformance: any[] = assessment.result.topicPerformance || [];
    let weakIds: any[] = assessment.result.weakTopics || [];
    let strongIds: any[] = assessment.result.strongTopics || [];
    let score: number = assessment.score ?? 0;

    const catalogEntry = SUBJECT_CATALOG.find((s) => s.name === subject.name);
    let scopeLabel = catalogEntry?.label ?? subject.name;

    if (categoryParam) {
      const { topicInstanceIds } = await getTopicInstanceIdsFor(subjectId, klass, categoryParam);
      const scopeSet = new Set(topicInstanceIds.map((id) => id.toString()));

      topicPerformance = topicPerformance.filter((tp) => scopeSet.has(tp.topicInstanceId.toString()));

      if (!topicPerformance.length) {
        res.status(200).json({ hasInsight: false });
        return;
      }

      weakIds = weakIds.filter((id) => scopeSet.has(id.toString()));
      strongIds = strongIds.filter((id) => scopeSet.has(id.toString()));

      const totalCorrect = topicPerformance.reduce((sum, tp) => sum + tp.correct, 0);
      const totalQuestions = topicPerformance.reduce((sum, tp) => sum + tp.total, 0);
      score = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      scopeLabel = humanizeLabel(categoryParam);
    }

    const topicInstanceIds = topicPerformance.map((tp) => tp.topicInstanceId);
    const topicInstances = await TopicInstance.find({ _id: { $in: topicInstanceIds } })
      .populate("topic", "name slug");

    const topicInfoMap = new Map<string, { name: string; slug: string }>();
    topicInstances.forEach((ti: any) => {
      topicInfoMap.set((ti._id as Types.ObjectId).toString(), {
        name: ti.topic?.name ?? "Unknown",
        slug: ti.topic?.slug ?? "",
      });
    });

    const topicSummaries = topicPerformance.map((tp) => ({
      name: topicInfoMap.get(tp.topicInstanceId.toString())?.name ?? "Unknown",
      accuracy: tp.accuracy,
    }));

    const buildTopicList = (ids: any[]) =>
      ids.map((id) => {
        const key = id.toString();
        const info = topicInfoMap.get(key);
        const tp = topicPerformance.find((t) => t.topicInstanceId.toString() === key);

        return {
          topicInstanceId: key,
          name: info?.name ?? "Unknown",
          slug: info?.slug ?? "",
          accuracy: tp?.accuracy ?? 0,
        };
      });

    const weakTopics = buildTopicList(weakIds);
    const strongTopics = buildTopicList(strongIds);

    const { recommendedNextTopic, explanation } = buildRecommendation(
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
      aiContent: assessment.aiContent ?? null,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};
