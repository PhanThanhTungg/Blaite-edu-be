import { Exam, Question } from "@prisma/client";

export interface ResponseCreateExam {
  exam: Exam;
  questions: Question[];
}