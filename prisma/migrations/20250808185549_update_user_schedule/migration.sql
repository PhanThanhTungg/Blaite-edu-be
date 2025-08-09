-- AlterTable
ALTER TABLE "users" ADD COLUMN     "scheduleKnowledgesId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_scheduleKnowledgesId_fkey" FOREIGN KEY ("scheduleKnowledgesId") REFERENCES "knowledges"("id") ON DELETE SET NULL ON UPDATE CASCADE;
