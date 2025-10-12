-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "pushinpayTxId" TEXT;

-- CreateIndex
CREATE INDEX "orders_pushinpayTxId_idx" ON "orders"("pushinpayTxId");
