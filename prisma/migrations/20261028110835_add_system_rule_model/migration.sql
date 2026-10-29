-- CreateTable
CREATE TABLE "system_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'WARNING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_rules_pkey" PRIMARY KEY ("id")
);
