-- AlterTable
ALTER TABLE "public"."Plan" ALTER COLUMN "stripePriceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Subscription" ALTER COLUMN "stripeSubscriptionId" DROP NOT NULL;
