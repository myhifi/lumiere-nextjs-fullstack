/*
  Warnings:

  - A unique constraint covering the columns `[triggerKey]` on the table `announcements` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "triggerKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "announcements_triggerKey_key" ON "announcements"("triggerKey");
