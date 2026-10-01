/*
  Warnings:

  - A unique constraint covering the columns `[nameEn]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "nameEn" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "categories_nameEn_key" ON "categories"("nameEn");
