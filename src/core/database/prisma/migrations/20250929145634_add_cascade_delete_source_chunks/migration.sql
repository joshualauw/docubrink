-- DropForeignKey
ALTER TABLE "public"."SourceChunk" DROP CONSTRAINT "SourceChunk_sourceId_fkey";

-- AddForeignKey
ALTER TABLE "public"."SourceChunk" ADD CONSTRAINT "SourceChunk_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."Source"("sourceId") ON DELETE CASCADE ON UPDATE CASCADE;
