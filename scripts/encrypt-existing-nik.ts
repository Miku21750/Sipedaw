import { PrismaClient } from "@prisma/client";
import { nikStorage } from "../src/lib/nik-crypto";

const prisma = new PrismaClient();

async function main() {
  const residents = await prisma.resident.findMany({
    where: { legacyNik: { not: null }, nikEncrypted: null },
    select: { id: true, legacyNik: true },
  });
  for (const resident of residents) {
    if (!resident.legacyNik) continue;
    await prisma.resident.update({ where: { id: resident.id }, data: nikStorage(resident.legacyNik.trim()) });
  }
  console.log(`${residents.length} NIK lama berhasil dienkripsi.`);
}

main().finally(() => prisma.$disconnect());
