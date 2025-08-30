/*
  Warnings:

  - Added the required column `searchUrl` to the `pii_sources` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."pii_sources" ADD COLUMN     "searchUrl" TEXT NOT NULL;
