/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePriceId]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeCustomerId_key" ON "public"."Organization"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripePriceId_key" ON "public"."Plan"("stripePriceId");
