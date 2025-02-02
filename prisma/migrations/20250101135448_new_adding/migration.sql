-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "contentid" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "contenttype" TEXT NOT NULL DEFAULT '';
