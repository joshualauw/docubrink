-- AlterTable
ALTER TABLE "public"."AiEmbedding" ADD COLUMN     "sourceId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."AiEmbedding" ADD CONSTRAINT "AiEmbedding_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."Source"("sourceId") ON DELETE SET NULL ON UPDATE CASCADE;
