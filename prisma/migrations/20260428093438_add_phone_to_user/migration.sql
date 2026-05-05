/*
  Warnings:

  - A unique constraint covering the columns `[no_hp]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "no_hp" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_no_hp_key" ON "User"("no_hp");
