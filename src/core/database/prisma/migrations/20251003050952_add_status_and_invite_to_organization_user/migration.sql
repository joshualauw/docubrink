-- CreateEnum
CREATE TYPE "public"."OrganizationUserStatus" AS ENUM ('INVITED', 'ACTIVE', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."OrganizationUser" ADD COLUMN     "inviteCode" TEXT,
ADD COLUMN     "inviteExpiryDate" TIMESTAMP(3),
ADD COLUMN     "status" "public"."OrganizationUserStatus" NOT NULL DEFAULT 'INVITED';
