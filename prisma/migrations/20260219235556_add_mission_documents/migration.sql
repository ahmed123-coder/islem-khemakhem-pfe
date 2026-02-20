-- CreateTable
CREATE TABLE "MissionDocument" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedById" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MissionDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MissionDocument_missionId_idx" ON "MissionDocument"("missionId");

-- CreateIndex
CREATE INDEX "MissionDocument_uploadedById_idx" ON "MissionDocument"("uploadedById");

-- AddForeignKey
ALTER TABLE "MissionDocument" ADD CONSTRAINT "MissionDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionDocument" ADD CONSTRAINT "MissionDocument_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
