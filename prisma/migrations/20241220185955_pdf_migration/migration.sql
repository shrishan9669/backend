-- CreateTable
CREATE TABLE "papers" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "pdf" BYTEA NOT NULL,

    CONSTRAINT "papers_pkey" PRIMARY KEY ("id")
);
