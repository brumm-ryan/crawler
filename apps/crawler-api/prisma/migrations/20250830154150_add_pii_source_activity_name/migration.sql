/*
  Warnings:

  - Added the required column `activityName` to the `pii_sources` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."pii_sources" ADD COLUMN     "activityName" TEXT NOT NULL;
