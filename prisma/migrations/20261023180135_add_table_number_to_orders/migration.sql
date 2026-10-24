-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "tableNumber" TEXT,
ALTER COLUMN "deliveryAddress" DROP NOT NULL;
