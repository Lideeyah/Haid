/*
  Warnings:

  - You are about to drop the column `simulatedDid` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[did]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."User_simulatedDid_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "",
ADD COLUMN     "did" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_did_key" ON "public"."User"("did");
