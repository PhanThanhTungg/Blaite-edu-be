/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `facebookId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `typeAuth` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clerkId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerkId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_email_key";

-- DropIndex
DROP INDEX "users_facebookId_key";

-- DropIndex
DROP INDEX "users_googleId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatarUrl",
DROP COLUMN "email",
DROP COLUMN "facebookId",
DROP COLUMN "googleId",
DROP COLUMN "name",
DROP COLUMN "password",
DROP COLUMN "phone",
DROP COLUMN "typeAuth",
ADD COLUMN     "clerkId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "TypeAuth";

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");
