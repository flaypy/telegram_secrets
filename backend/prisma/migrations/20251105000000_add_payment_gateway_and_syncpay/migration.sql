-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('PUSHINPAY', 'SYNCPAY');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "gateway" "PaymentGateway" NOT NULL DEFAULT 'PUSHINPAY';
ALTER TABLE "orders" ADD COLUMN "syncpayTxId" TEXT;

-- CreateIndex
CREATE INDEX "orders_syncpayTxId_idx" ON "orders"("syncpayTxId");
