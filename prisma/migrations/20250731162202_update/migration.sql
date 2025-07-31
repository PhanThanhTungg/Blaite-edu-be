/*
  Warnings:

  - You are about to drop the column `knowledgeId` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the `QuestionType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `examId` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TypeExam" AS ENUM ('evaluate', 'practice');

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_knowledgeId_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_typeId_fkey";

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "knowledgeId",
ADD COLUMN     "examId" TEXT NOT NULL;

-- DropTable
DROP TABLE "QuestionType";

-- CreateTable
CREATE TABLE "question_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompt" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "knowledgeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompt" TEXT,
    "type" "TypeExam" NOT NULL DEFAULT 'practice',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "knowledges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "question_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
