/*
  Warnings:

  - The `backimg` column on the `student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profileimg` column on the `student` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "student" DROP COLUMN "backimg",
ADD COLUMN     "backimg" BYTEA,
DROP COLUMN "profileimg",
ADD COLUMN     "profileimg" BYTEA;
