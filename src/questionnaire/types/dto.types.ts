export interface CreateQuestionDTO {
  questionNumber: string;
  question: string;
  options: {
    key: string;
    text: string;
    trait: string;
  }[];
  category: "learning_style" | "cognitive";
  answer?: string;
}
