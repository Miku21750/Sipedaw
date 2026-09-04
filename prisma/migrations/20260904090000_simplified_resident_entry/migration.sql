-- Fields unavailable from NIK are optional; structured region codes are derived locally.
ALTER TABLE "Resident" ALTER COLUMN "address" DROP NOT NULL;
ALTER TABLE "Resident"
ADD COLUMN "provinceCode" CHAR(2),
ADD COLUMN "regencyCode" CHAR(4),
ADD COLUMN "districtCode" CHAR(6);

CREATE INDEX "Resident_districtCode_idx" ON "Resident"("districtCode");
