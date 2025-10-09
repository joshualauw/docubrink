/*
  Warnings:

  - Made the column `endDate` on table `Subscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stripeSubscriptionId` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Subscription" ALTER COLUMN "endDate" SET NOT NULL,
ALTER COLUMN "stripeSubscriptionId" SET NOT NULL;
