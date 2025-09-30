/*
  Warnings:

  - You are about to drop the column `status` on the `AiEmbedding` table. All the data in the column will be lost.
  - Added the required column `status` to the `Source` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."SourceStatus" AS ENUM ('PROCESSING', 'FAILED', 'DONE');

-- AlterTable
ALTER TABLE "public"."AiEmbedding" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "public"."Source" ADD COLUMN     "status" "public"."SourceStatus" NOT NULL;

-- DropEnum
DROP TYPE "public"."EmbeddingStatus";
