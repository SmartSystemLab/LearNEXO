export type QuestionOptionsDto = {
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
}

export type CreateQuestionDto ={
  questionNumber: string;
  question: string;
  options: QuestionOptionsDto;
  answer: 'a' | 'b' | 'c' | 'd' | 'e';
  category: 'Assessment' | 'Questionnaire';
}

export type AnswerQuestionDto = {
  questionId: string;
  answer: 'a' | 'b' | 'c' | 'd' | 'e';
}

export type ScoreResponse = {
    scores: Record<string, number>;
    breakdown: Record<string, { correct: number; total: number }>;
    total: { correct: number; total: number };
};

export type TopicDef = {
  topic_id: string;
  name: string;
  tags: string[];
  prerequisite: string | null;
};

export type PredictPayload = {
  student: string;
  scores: Record<string, number>;
  topics: TopicDef[];
  mastery_threshold: number;
  enrich_with_llm: boolean;
};

export type BuildOptions = {
  student: string;
  mapping: Record<string, TopicDef>;
  mastery_threshold?: number;
  enrich_with_llm?: boolean;
};