import { EUserRole } from "./enums.type";

export type SignUpDto = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: EUserRole;
}

export type LoginDto = {
    email: string;
    password: string;
}

export type VerifyDto = {
    email: string;
    otp: string;
}

export type PastExamDto = {
  firstTerm: string;
  secondTerm: string;
  thirdTerm: string;
};

export type LearningProfileDto = {
  learningStyle?: "visual" | "auditory" | "reading" | "kinesthetic" | null;
  confidence?: number | null;
  cognitiveScore?: number | null;
  recommendedFormats?: string[];
  explanation?: string | null;
  risk_of_misclassification?: "low" | "medium" | "high" | null;
  lastUpdated?: Date | null;
};

export type OnboardingDto = {
  user?: string;
  userId?: string;
  dateOfBirth: Date;
  studentClass: string;
  gender: "male" | "female" | "other";
  stateOfOrigin: string;
  residentialAddress: string;
  town: string;
  state: string;
  schoolName: string;
  schoolAddress: string;
  learningProfile?: LearningProfileDto;
  learningStyle?: string;
  pastExam: PastExamDto;
  photo?: string | Express.Multer.File | File | null;
  language: string;
};

