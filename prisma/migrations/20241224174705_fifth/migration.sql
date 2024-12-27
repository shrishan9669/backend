-- AlterTable
ALTER TABLE "student" ADD COLUMN     "contributions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userpaper" BYTEA[];
