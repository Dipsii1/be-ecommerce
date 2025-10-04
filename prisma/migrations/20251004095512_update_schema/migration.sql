-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT;

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "category" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "public"."orders"("status");

-- CreateIndex
CREATE INDEX "products_expired_idx" ON "public"."products"("expired");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "public"."products"("name");
