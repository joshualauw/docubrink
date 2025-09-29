/*
  Warnings:

  - Added the required column `rawText` to the `Source` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Source" ADD COLUMN     "rawText" TEXT NOT NULL;
