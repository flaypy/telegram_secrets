/*
  Warnings:

  - Added the required column `deliveryLink` to the `prices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "prices" ADD COLUMN     "deliveryLink" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "telegramLink" TEXT;
