import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { problems } from "./data";

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding ${problems.length} problems...`);

  for (const { id, testCases, ...data } of problems) {
    // 固定IDでupsertするため、再実行しても重複しない（回答履歴やSRSカードは保持される）
    await prisma.$transaction([
      prisma.problem.upsert({
        where: { id },
        create: { id, ...data },
        update: data,
      }),
      prisma.testCase.deleteMany({ where: { problemId: id } }),
      prisma.testCase.createMany({
        data: testCases.map((testCase) => ({ ...testCase, problemId: id })),
      }),
    ]);
  }

  const seededIds = problems.map((problem) => problem.id);
  const stale = await prisma.problem.findMany({
    where: { id: { notIn: seededIds } },
    select: { id: true },
  });
  if (stale.length > 0) {
    console.warn(
      `${stale.length} problems in the database are not in the seed data: ${stale.map((p) => p.id).join(", ")}`
    );
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
