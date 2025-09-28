/*
  Warnings:

  - Added the required column `stripeCustomerId` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Organization" ADD COLUMN     "stripeCustomerId" TEXT NOT NULL;
