/*
  Warnings:

  - Added the required column `role` to the `OrganizationInvite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."OrganizationInvite" ADD COLUMN     "role" "public"."Role" NOT NULL;
