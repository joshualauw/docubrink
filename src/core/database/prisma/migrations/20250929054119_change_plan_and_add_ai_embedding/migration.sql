/*
  Warnings:

  - You are about to drop the column `aiTokenLimit` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Source` table. All the data in the column will be lost.
  - Added the required column `embeddingTokenLimit` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxDocuments` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `queryTokenLimit` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."EmbeddingStatus" AS ENUM ('PROCESSING', 'FAILED', 'DONE');

-- AlterTable
ALTER TABLE "public"."Plan" DROP COLUMN "aiTokenLimit",
ADD COLUMN     "embeddingTokenLimit" INTEGER NOT NULL,
ADD COLUMN     "maxDocuments" INTEGER NOT NULL,
ADD COLUMN     "queryTokenLimit" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Source" DROP COLUMN "status";

-- DropEnum
DROP TYPE "public"."SourceStatus";

-- CreateTable
CREATE TABLE "public"."AiEmbedding" (
    "aiEmbeddingId" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "status" "public"."EmbeddingStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiEmbedding_pkey" PRIMARY KEY ("aiEmbeddingId")
);

-- AddForeignKey
ALTER TABLE "public"."AiEmbedding" ADD CONSTRAINT "AiEmbedding_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
