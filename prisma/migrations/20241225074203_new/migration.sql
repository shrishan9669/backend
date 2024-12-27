/*
  Warnings:

  - You are about to drop the column `userpaper` on the `student` table. All the data in the column will be lost.
  - Added the required column `studentid` to the `papers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "papers" ADD COLUMN     "studentid" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "student" DROP COLUMN "userpaper";

-- AddForeignKey
ALTER TABLE "papers" ADD CONSTRAINT "papers_studentid_fkey" FOREIGN KEY ("studentid") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
