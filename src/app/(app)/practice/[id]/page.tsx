import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProblemSolver } from "./problem-solver";

interface Props {
  params: Promise<{ id: string }>;
}

async function getProblem(id: string) {
  return prisma.problem.findUnique({
    where: { id },
    include: {
      testCases: true,
    },
  });
}

export default async function ProblemPage({ params }: Props) {
  const { id } = await params;
  const problem = await getProblem(id);

  if (!problem) {
    notFound();
  }

  return (
    <ProblemSolver
      problem={{
        id: problem.id,
        category: problem.category,
        level: problem.level,
        difficulty: problem.difficulty as "easy" | "medium" | "hard",
        promptJa: problem.promptJa,
        starterCode: problem.starterCode,
        expectedAnswer: problem.expectedAnswer,
        hints: problem.hints,
        explanation: problem.explanation,
        testCases: problem.testCases.map((tc) => ({
          description: tc.description,
          code: tc.code,
          shouldPass: tc.shouldPass,
        })),
      }}
    />
  );
}
