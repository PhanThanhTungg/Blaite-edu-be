import { Exam, Question } from "generated/prisma";

export interface ResponseCreateExam {
  exam: Exam;
  questions: Question[];
}