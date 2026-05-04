import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.rewardPool.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      amount: "",
      description: "Reward pool not announced yet.",
      active: false,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
