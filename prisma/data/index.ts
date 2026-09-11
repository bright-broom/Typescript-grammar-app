import { level1Problems } from "./level1";
import { level2Problems } from "./level2";
import { level3Problems } from "./level3";
import type { ProblemSeed } from "./types";

export type { ProblemSeed, TestCaseSeed } from "./types";

export const problems: ProblemSeed[] = [...level1Problems, ...level2Problems, ...level3Problems];
