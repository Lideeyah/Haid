-- AlterTable
ALTER TABLE "public"."AidLog" ADD COLUMN     "hederaTx" JSONB;

-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "hederaTx" JSONB;
