-- CreateTable
CREATE TABLE "notes" (
    "id" SERIAL NOT NULL,
    "course" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "pdf" BYTEA NOT NULL,
    "studentid" INTEGER NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_studentid_fkey" FOREIGN KEY ("studentid") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
