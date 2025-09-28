/*
  Warnings:

  - The values [ORGANIZER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `userLimit` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('ADMIN', 'MEMBER');
ALTER TABLE "public"."OrganizationUser" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Plan" DROP COLUMN "userLimit";
