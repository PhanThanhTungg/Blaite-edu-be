/*
  Warnings:

  - You are about to drop the column `avgScore` on the `knowledges` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `facebookId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `typeAuth` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clerkId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerkId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `streak` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "TypeQuestion" AS ENUM ('theory', 'practice');

-- DropIndex
DROP INDEX "users_email_key";

-- DropIndex
DROP INDEX "users_facebookId_key";

-- DropIndex
DROP INDEX "users_googleId_key";

-- AlterTable
ALTER TABLE "activities" ALTER COLUMN "date" SET DATA TYPE TEXT,
ALTER COLUMN "timezone" SET DEFAULT 'Asia/Ho_Chi_Minh';

-- AlterTable
ALTER TABLE "knowledges" DROP COLUMN "avgScore",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "type" "TypeQuestion" NOT NULL;

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatarUrl",
DROP COLUMN "email",
DROP COLUMN "facebookId",
DROP COLUMN "googleId",
DROP COLUMN "name",
DROP COLUMN "password",
DROP COLUMN "phone",
DROP COLUMN "typeAuth",
ADD COLUMN     "clerkId" TEXT NOT NULL,
ADD COLUMN     "intervalSendMessage" INTEGER,
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "timezone" SET DEFAULT 'Asia/Ho_Chi_Minh',
ALTER COLUMN "streak" SET NOT NULL;

-- DropEnum
DROP TYPE "TypeAuth";

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");
