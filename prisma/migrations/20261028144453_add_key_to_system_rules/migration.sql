/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `system_rules` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "system_rules" ADD COLUMN     "key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "system_rules_key_key" ON "system_rules"("key");
