/*
  Warnings:

  - You are about to drop the column `topicId` on the `questions` table. All the data in the column will be lost.
  - Added the required column `typeId` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_knowledgeId_fkey";

-- AlterTable
ALTER TABLE "knowledges" ADD COLUMN     "theory" TEXT;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "topicId",
ADD COLUMN     "typeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "QuestionType" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "knowledges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "QuestionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
