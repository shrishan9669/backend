-- AlterTable
ALTER TABLE "notes" ALTER COLUMN "pdf" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "papers" ALTER COLUMN "pdf" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "student" ALTER COLUMN "backimg" SET DATA TYPE TEXT,
ALTER COLUMN "profileimg" SET DATA TYPE TEXT;
