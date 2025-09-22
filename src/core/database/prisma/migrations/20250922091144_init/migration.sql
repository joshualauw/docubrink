CREATE EXTENSION vector;

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'ORGANIZER');

-- CreateEnum
CREATE TYPE "public"."SourceType" AS ENUM ('UPLOAD', 'URL', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."SourceStatus" AS ENUM ('PROCESSING', 'FAILED', 'DONE');

-- CreateTable
CREATE TABLE "public"."Plan" (
    "planId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "apiCallLimit" INTEGER NOT NULL,
    "aiTokenLimit" INTEGER NOT NULL,
    "userLimit" INTEGER NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("planId")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "subscriptionId" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "renewalDate" TIMESTAMP(3),
    "canceledDate" TIMESTAMP(3),
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("subscriptionId")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "userId" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "role" "public"."Role" NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profileUrl" TEXT,
    "authProviderName" "public"."AuthProvider",
    "authProviderId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."Organization" (
    "organizationId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("organizationId")
);

-- CreateTable
CREATE TABLE "public"."Source" (
    "sourceId" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" "public"."SourceType" NOT NULL,
    "status" "public"."SourceStatus" NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("sourceId")
);

-- CreateTable
CREATE TABLE "public"."SourceChunk" (
    "sourceChunkId" SERIAL NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "chunkText" TEXT NOT NULL,
    "embedding" vector NOT NULL,

    CONSTRAINT "SourceChunk_pkey" PRIMARY KEY ("sourceChunkId")
);

-- CreateTable
CREATE TABLE "public"."AiQuery" (
    "aiQueryId" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "queryText" TEXT NOT NULL,
    "responseText" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,

    CONSTRAINT "AiQuery_pkey" PRIMARY KEY ("aiQueryId")
);

-- CreateTable
CREATE TABLE "public"."ApiKey" (
    "apiKeyId" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "keyHash" TEXT NOT NULL,
    "scopes" TEXT[],
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("apiKeyId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "public"."ApiKey"("keyHash");

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("planId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Source" ADD CONSTRAINT "Source_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SourceChunk" ADD CONSTRAINT "SourceChunk_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."Source"("sourceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AiQuery" ADD CONSTRAINT "AiQuery_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiKey" ADD CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
