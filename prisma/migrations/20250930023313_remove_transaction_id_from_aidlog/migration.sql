/*
  Warnings:

  - You are about to drop the column `transactionId` on the `AidLog` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."AidLog_transactionId_key";

-- AlterTable
ALTER TABLE "public"."AidLog" DROP COLUMN "transactionId";
