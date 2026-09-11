import type { CategoryId, Difficulty, Level } from "../../src/lib/constants";

export interface TestCaseSeed {
  description: string;
  code: string;
  shouldPass: boolean;
}

export interface ProblemSeed {
  /** 固定ID（`<category>-<level>-<連番>`）。再シード時のupsertキー */
  id: string;
  category: CategoryId;
  level: Level;
  difficulty: Difficulty;
  promptJa: string;
  promptEn?: string;
  starterCode: string;
  expectedAnswer: string;
  hints: string[];
  explanation: string;
  tags: string[];
  testCases: TestCaseSeed[];
}
