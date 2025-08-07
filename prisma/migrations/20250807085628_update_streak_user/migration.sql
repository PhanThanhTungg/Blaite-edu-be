/*
  Warnings:

  - Made the column `streak` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "streak" SET NOT NULL;
