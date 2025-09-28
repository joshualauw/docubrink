/*
  Warnings:

  - Added the required column `stripePriceId` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "stripePriceId" TEXT NOT NULL;
