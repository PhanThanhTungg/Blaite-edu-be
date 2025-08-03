/*
  Warnings:

  - Added the required column `type` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TypeQuestion" AS ENUM ('theory', 'practice');

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "type" "TypeQuestion" NOT NULL;
