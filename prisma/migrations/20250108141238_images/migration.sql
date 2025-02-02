/*
  Warnings:

  - Added the required column `backimg` to the `student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileimg` to the `student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "student" ADD COLUMN     "backimg" BYTEA NOT NULL,
ADD COLUMN     "profileimg" BYTEA NOT NULL;
