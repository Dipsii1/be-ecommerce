/*
  Warnings:

  - You are about to drop the column `displayNumber` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."merchant_profiles" ADD COLUMN     "address" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "displayNumber";
