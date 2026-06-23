import mongoose, { Types } from "mongoose";
import Subject from "./models/subject.model";
import Topic from "./models/topic.model";
import TopicInstance from "./models/topicInstance.model";
import UserTopicMastery from "./models/userTopicMastery.model";

// Matches the frontend's `Recommendation` type (src/utils/types/baseTypes.ts).
export interface Recommendation {
  feedback: string;
  recommend_for: string;
  recommended_topic: string;
}

// Resolve a :subject route param - either a Mongo ObjectId or a catalog name/slug.
export async function resolveSubject(subjectParam: string) {
  if (mongoose.Types.ObjectId.isValid(subjectParam)) {
    return Subject.findById(subjectParam);
  }
  return Subject.findOne({ name: subjectParam.toLowerCase().trim() });
}

// Average masteryScore (0-100, default 0) across a set of TopicInstance ids for a user.
// Mirrors the subjectMastery loop in submitAssessment.
export async function computeAverageMastery(
  userId: Types.ObjectId | string,
  topicInstanceIds: Types.ObjectId[],
): Promise<number> {
  if (!topicInstanceIds.length) return 0;

  const masteryRows = await UserTopicMastery.find({
    userId,
    topicInstanceId: { $in: topicInstanceIds },
  }).select("topicInstanceId masteryScore");

  const masteryMap = new Map<string, number>();
  masteryRows.forEach((m) =>
    masteryMap.set(m.topicInstanceId.toString(), m.masteryScore),
  );

  let total = 0;
  for (const id of topicInstanceIds) {
    total += masteryMap.get(id.toString()) || 0;
  }

  return Math.round(total / topicInstanceIds.length);
}

// All TopicInstance ids for subject+class, optionally filtered to Topics with a given
// `category` (a free-form string - categories are per-subject, not a global enum).
export async function getTopicInstanceIdsFor(
  subjectId: Types.ObjectId,
  klass: string,
  category?: string,
): Promise<{ topicInstanceIds: Types.ObjectId[]; topicIds: Types.ObjectId[] }> {
  const topicFilter: Record<string, unknown> = { subject: subjectId };
  if (category) topicFilter.category = category;

  const topics = await Topic.find(topicFilter).select("_id");
  const topicIds = topics.map((t) => t._id as Types.ObjectId);

  if (!topicIds.length) {
    return { topicInstanceIds: [], topicIds: [] };
  }

  const topicInstances = await TopicInstance.find({
    subject: subjectId,
    class: klass,
    topic: { $in: topicIds },
  }).select("_id");

  return {
    topicInstanceIds: topicInstances.map((ti) => ti._id as Types.ObjectId),
    topicIds,
  };
}

// "grammar" -> "Grammar", "number_theory" -> "Number Theory" - derives a display label
// for whatever category strings exist on a subject's topics.
export function humanizeLabel(value: string): string {
  return value
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Given populated topic summaries ({name, accuracy}[]) for all assessed topics in a scope,
// plus the names of weak/strong topics within that scope and a human-readable scope label
// (e.g. "Grammar" or "English Language"), derive a templated recommendation. Shared by
// submitAssessment's response and the /insight endpoints.
export function buildRecommendation(
  topicSummaries: { name: string; accuracy: number }[],
  weakNames: string[],
  strongNames: string[],
  scopeLabel: string,
): {
  recommendedNextTopic: { name: string; accuracy: number };
  explanation: string;
  recommendations: Recommendation[];
} {
  if (!topicSummaries.length) {
    return {
      recommendedNextTopic: { name: scopeLabel, accuracy: 0 },
      explanation: `No topic performance data available yet for ${scopeLabel}.`,
      recommendations: [],
    };
  }

  const sorted = [...topicSummaries].sort((a, b) => a.accuracy - b.accuracy);
  const recommendedNextTopic = sorted[0];

  const weakSet = new Set(weakNames);
  const weakTargets = topicSummaries.filter((t) => weakSet.has(t.name));
  const recommendationTargets = weakTargets.length
    ? weakTargets
    : [recommendedNextTopic];

  const recommendations: Recommendation[] = recommendationTargets.map((t) => ({
    recommended_topic: t.name,
    recommend_for: scopeLabel,
    feedback: `You scored ${t.accuracy}% on ${t.name}. Focus on practicing this topic to improve.`,
  }));

  const explanation = strongNames.length
    ? `You're doing well in ${strongNames.join(", ")}. Focus next on "${recommendedNextTopic.name}" (${recommendedNextTopic.accuracy}%) to strengthen your overall ${scopeLabel} performance.`
    : `Focus next on "${recommendedNextTopic.name}" (${recommendedNextTopic.accuracy}%) to strengthen your overall ${scopeLabel} performance.`;

  return { recommendedNextTopic, explanation, recommendations };
}
