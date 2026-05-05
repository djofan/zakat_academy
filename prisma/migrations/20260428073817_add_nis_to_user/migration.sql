/*
  Warnings:

  - A unique constraint covering the columns `[fileUrl]` on the table `LessonAttachment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nis]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "QuizAttempt" ADD COLUMN     "answers" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nis" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "LessonAttachment_fileUrl_key" ON "LessonAttachment"("fileUrl");

-- CreateIndex
CREATE UNIQUE INDEX "User_nis_key" ON "User"("nis");
