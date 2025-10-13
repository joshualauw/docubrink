-- AlterTable
ALTER TABLE "public"."Organization" ADD COLUMN     "aiEmbeddingUsage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "aiQueryUsage" INTEGER NOT NULL DEFAULT 0;
