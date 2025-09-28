/*
  Warnings:

  - Added the required column `price` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
