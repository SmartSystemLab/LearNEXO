import { EUserRole } from "./enums.type";

export type SignUpDto = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    userImage: string;
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

export type OnboardingDto = {
  dateOfBirth: Date;
  class: string;
  gender: string;
  town: string;
  state: string;
  schoolName: string;
  schoolAddress: string;
  learningStyle: string;
  pastExam: PastExamDto;
  photo: string;
  language: string;
};
