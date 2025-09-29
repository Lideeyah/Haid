-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "description" TEXT,
ADD COLUMN     "quantity" INTEGER,
ADD COLUMN     "supplies" TEXT[];
