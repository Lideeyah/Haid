-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL,
    "simulatedDid" TEXT,
    "qrCodeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AidLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "AidLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_simulatedDid_key" ON "public"."User"("simulatedDid");

-- CreateIndex
CREATE UNIQUE INDEX "AidLog_transactionId_key" ON "public"."AidLog"("transactionId");

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AidLog" ADD CONSTRAINT "AidLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AidLog" ADD CONSTRAINT "AidLog_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AidLog" ADD CONSTRAINT "AidLog_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
