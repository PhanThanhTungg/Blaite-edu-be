-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_knowledgeId_fkey";

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "knowledges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
