import { BookOpen, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, DIFFICULTY_LABELS, type Difficulty } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const difficultyColors: Record<Difficulty, string> = {
  easy: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export function categoryName(categoryId: string): string {
  return CATEGORIES.find((c) => c.id === categoryId)?.name ?? categoryId;
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const key = (difficulty in DIFFICULTY_LABELS ? difficulty : "easy") as Difficulty;
  return <Badge className={difficultyColors[key]}>{DIFFICULTY_LABELS[key]}</Badge>;
}

export function ProblemBadges({
  category,
  level,
  difficulty,
  showCategory = true,
  className,
}: {
  category: string;
  level: number;
  difficulty: string;
  showCategory?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {showCategory && (
        <Badge variant="outline" className="gap-1">
          <BookOpen className="h-3 w-3" aria-hidden />
          {categoryName(category)}
        </Badge>
      )}
      <Badge variant="outline" className="gap-1">
        <Code2 className="h-3 w-3" aria-hidden />
        Level {level}
      </Badge>
      <DifficultyBadge difficulty={difficulty} />
    </div>
  );
}
