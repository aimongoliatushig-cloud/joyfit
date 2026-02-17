import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

function hashPin(pin: string): string {
  return createHash("sha256").update(pin).digest("hex");
}

async function main() {
  const phone = "99112233";
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    console.log("Demo user already exists:", phone);
    return;
  }

  await prisma.user.create({
    data: {
      phone,
      pinHash: hashPin("1234"),
      inviterRef: null,
      profile: {
        create: {
          startWeightKg: 75,
          targetWeightKg: 70,
          heightCm: 170,
          planChoice: "one_month",
          weeklyCheckinDay: "sun",
        },
      },
      weighIns: {
        create: {
          weightKg: 75,
          weekKey: "2025-W08",
        },
      },
    },
  });

  console.log("Demo user created: phone=99112233, PIN=1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
