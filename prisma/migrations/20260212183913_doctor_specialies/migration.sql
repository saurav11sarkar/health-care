-- CreateTable
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_specialies" (
    "specialiesId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_specialies_pkey" PRIMARY KEY ("specialiesId","doctorId")
);

-- AddForeignKey
ALTER TABLE "doctor_specialies" ADD CONSTRAINT "doctor_specialies_specialiesId_fkey" FOREIGN KEY ("specialiesId") REFERENCES "specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_specialies" ADD CONSTRAINT "doctor_specialies_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
