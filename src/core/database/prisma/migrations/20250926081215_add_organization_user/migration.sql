/*
  Warnings:

  - You are about to drop the column `organizationId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_organizationId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "organizationId";

-- CreateTable
CREATE TABLE "public"."OrganizationUser" (
    "organizationUserId" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "public"."Role" NOT NULL,

    CONSTRAINT "OrganizationUser_pkey" PRIMARY KEY ("organizationUserId")
);

-- AddForeignKey
ALTER TABLE "public"."OrganizationUser" ADD CONSTRAINT "OrganizationUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationUser" ADD CONSTRAINT "OrganizationUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
