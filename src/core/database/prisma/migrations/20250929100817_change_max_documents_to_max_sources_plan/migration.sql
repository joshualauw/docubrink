/*
  Warnings:

  - You are about to drop the column `maxDocuments` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Plan" DROP COLUMN "maxDocuments",
ADD COLUMN     "maxSources" INTEGER NOT NULL DEFAULT 0;
