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