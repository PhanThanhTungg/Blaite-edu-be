/*
  Warnings:

  - The `status` column on the `classes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "classes" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'active';
