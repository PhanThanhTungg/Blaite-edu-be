-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_userId_fkey";

-- DropForeignKey
ALTER TABLE "knowledges" DROP CONSTRAINT "knowledges_topicId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_scheduleKnowledgesId_fkey";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_scheduleKnowledgesId_fkey" FOREIGN KEY ("scheduleKnowledgesId") REFERENCES "knowledges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledges" ADD CONSTRAINT "knowledges_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
