/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "stripeCustomerId",
ALTER COLUMN "stripeStatus" DROP NOT NULL;
