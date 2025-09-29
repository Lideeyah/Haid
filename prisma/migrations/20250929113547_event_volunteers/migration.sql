-- CreateTable
CREATE TABLE "public"."_EventVolunteers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventVolunteers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventVolunteers_B_index" ON "public"."_EventVolunteers"("B");

-- AddForeignKey
ALTER TABLE "public"."_EventVolunteers" ADD CONSTRAINT "_EventVolunteers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventVolunteers" ADD CONSTRAINT "_EventVolunteers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
