/*
  Warnings:

  - Added the required column `name` to the `knowledges` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "activities" ALTER COLUMN "timezone" SET DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "knowledges" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "timezone" SET DEFAULT 'UTC';
