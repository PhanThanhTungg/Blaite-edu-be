/*
  Warnings:

  - You are about to drop the column `clerkUserId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[facebookId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TypeAuth" AS ENUM ('account', 'google', 'facebook');

-- DropIndex
DROP INDEX "users_clerkUserId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "clerkUserId",
DROP COLUMN "refreshToken",
ADD COLUMN     "facebookId" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "typeAuth" "TypeAuth" NOT NULL DEFAULT 'account';

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_facebookId_key" ON "users"("facebookId");
