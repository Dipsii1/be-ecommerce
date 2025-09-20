/*
  Warnings:

  - You are about to drop the column `userId` on the `merchant_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `merchant_profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `merchant_profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `merchant_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `merchant_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `merchant_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."merchant_profiles" DROP CONSTRAINT "merchant_profiles_userId_fkey";

-- DropIndex
DROP INDEX "public"."merchant_profiles_userId_key";

-- AlterTable
ALTER TABLE "public"."merchant_profiles" DROP COLUMN "userId",
DROP COLUMN "verified",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'merchant',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "merchant_profiles_email_key" ON "public"."merchant_profiles"("email");
