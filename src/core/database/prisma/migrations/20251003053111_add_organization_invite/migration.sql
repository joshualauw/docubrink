/*
  Warnings:

  - You are about to drop the column `inviteCode` on the `OrganizationUser` table. All the data in the column will be lost.
  - You are about to drop the column `inviteExpiryDate` on the `OrganizationUser` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `OrganizationUser` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('INVITED', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."OrganizationUser" DROP COLUMN "inviteCode",
DROP COLUMN "inviteExpiryDate",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "public"."OrganizationUserStatus";

-- CreateTable
CREATE TABLE "public"."OrganizationInvite" (
    "organizationInviteId" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "status" "public"."InvitationStatus" NOT NULL,
    "code" TEXT NOT NULL,
    "expiredDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationInvite_pkey" PRIMARY KEY ("organizationInviteId")
);

-- AddForeignKey
ALTER TABLE "public"."OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("organizationId") ON DELETE RESTRICT ON UPDATE CASCADE;
