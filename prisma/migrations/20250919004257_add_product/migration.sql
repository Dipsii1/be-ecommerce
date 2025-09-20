-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'user';

-- CreateTable
CREATE TABLE "public"."products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "merchantId" INTEGER NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "public"."merchant_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
