import { PrismaClient } from "@prisma/client";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: qa-get-email-code.ts <email>");
    process.exit(1);
  }
  const prisma = new PrismaClient();
  try {
    const row = await prisma.emailVerificationCode.findFirst({
      where: { email, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    console.log(row?.code ?? "");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
