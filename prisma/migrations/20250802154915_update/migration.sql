/*
  Warnings:

  - You are about to drop the column `content` on the `knowledges` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `topics` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `topics` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `topics` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `topics` table. All the data in the column will be lost.
  - You are about to drop the column `clerkUserId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[facebookId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `knowledges` table without a default value. This is not possible if the table is not empty.
  - Made the column `knowledgeId` on table `questions` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `classId` to the `topics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `topics` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TypeAuth" AS ENUM ('account', 'google', 'facebook');

-- CreateEnum
CREATE TYPE "LevelClass" AS ENUM ('beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "StatusClass" AS ENUM ('private', 'protected', 'public');

-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_roleId_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_knowledgeId_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_topicId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_roleId_fkey";

-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_userId_fkey";

-- DropIndex
DROP INDEX "users_clerkUserId_key";

-- AlterTable
ALTER TABLE "activities" ALTER COLUMN "timezone" SET DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "knowledges" DROP COLUMN "content",
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "prompt" TEXT NOT NULL DEFAULT 'Không có mô tả',
ADD COLUMN     "theory" TEXT;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "messageId",
DROP COLUMN "topicId",
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "explain" TEXT,
ALTER COLUMN "knowledgeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "topics" DROP COLUMN "created_at",
DROP COLUMN "description",
DROP COLUMN "updated_at",
DROP COLUMN "userId",
ADD COLUMN     "classId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "prompt" SET DEFAULT 'Không có mô tả';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "clerkUserId",
ADD COLUMN     "facebookId" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "typeAuth" "TypeAuth" NOT NULL DEFAULT 'account',
ALTER COLUMN "timezone" SET DEFAULT 'UTC';

-- DropTable
DROP TABLE "admins";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "role_permissions";

-- DropTable
DROP TABLE "roles";

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" "StatusClass" NOT NULL DEFAULT 'private',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_facebookId_key" ON "users"("facebookId");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledges" ADD CONSTRAINT "knowledges_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "knowledges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "knowledges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
