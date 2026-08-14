-- Encrypted NIK storage. Existing plaintext is retained temporarily in the renamed
-- column and can be converted safely with `npm run db:encrypt-existing`.
ALTER TABLE "Resident" ALTER COLUMN "nik" DROP NOT NULL;
ALTER TABLE "Resident" ADD COLUMN "nikEncrypted" TEXT,
ADD COLUMN "nikHash" CHAR(64),
ADD COLUMN "nikLastFour" CHAR(4) NOT NULL DEFAULT '????';
CREATE UNIQUE INDEX "Resident_nikHash_key" ON "Resident"("nikHash");

CREATE TYPE "CorrectionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "CorrectionRequest" (
  "id" TEXT NOT NULL,
  "residentId" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "proposedData" JSONB NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "CorrectionStatus" NOT NULL DEFAULT 'PENDING',
  "reviewNote" TEXT,
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CorrectionRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExportLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "format" TEXT NOT NULL DEFAULT 'XLSX',
  "filters" JSONB,
  "recordCount" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ExportLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CorrectionRequest_status_createdAt_idx" ON "CorrectionRequest"("status", "createdAt");
CREATE INDEX "CorrectionRequest_residentId_idx" ON "CorrectionRequest"("residentId");
CREATE INDEX "ExportLog_createdAt_idx" ON "ExportLog"("createdAt");
ALTER TABLE "CorrectionRequest" ADD CONSTRAINT "CorrectionRequest_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CorrectionRequest" ADD CONSTRAINT "CorrectionRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CorrectionRequest" ADD CONSTRAINT "CorrectionRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExportLog" ADD CONSTRAINT "ExportLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
