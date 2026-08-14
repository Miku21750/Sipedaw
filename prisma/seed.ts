import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin123!", 12);
  const officerHash = await bcrypt.hash("Petugas123!", 12);

  const team = await prisma.team.upsert({
    where: { code: "TIM-01" },
    update: {},
    create: { code: "TIM-01", name: "Tim 01" },
  });

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Administrator",
      username: "admin",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { username: "petugas01" },
    update: {},
    create: {
      name: "Petugas 01",
      username: "petugas01",
      passwordHash: officerHash,
      role: UserRole.FIELD_OFFICER,
      teamId: team.id,
    },
  });
}

main()
  .then(() => console.log("Seed selesai."))
  .finally(() => prisma.$disconnect());
