-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "description" TEXT,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "MissionStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Mission_clientId_idx" ON "Mission"("clientId");

-- CreateIndex
CREATE INDEX "Mission_consultantId_idx" ON "Mission"("consultantId");

-- CreateIndex
CREATE INDEX "Mission_status_idx" ON "Mission"("status");
