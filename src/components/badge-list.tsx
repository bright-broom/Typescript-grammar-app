import { BADGES } from "@/lib/gamification";
import { cn } from "@/lib/utils";

/** 獲得済みバッジと未獲得バッジの一覧 */
export function BadgeList({
  earned,
  showLocked = true,
}: {
  earned: { id: string; earnedAt: Date }[];
  showLocked?: boolean;
}) {
  const earnedById = new Map(earned.map((badge) => [badge.id, badge.earnedAt]));
  const badges = showLocked ? BADGES : BADGES.filter((badge) => earnedById.has(badge.id));

  if (badges.length === 0) {
    return <p className="text-sm text-muted-foreground">まだバッジはありません。問題を解いて獲得しましょう！</p>;
  }

  return (
    <ul className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {badges.map((badge) => {
        const earnedAt = earnedById.get(badge.id);
        return (
          <li
            key={badge.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3",
              earnedAt ? "bg-yellow-500/5 border-yellow-500/30" : "opacity-50 grayscale"
            )}
          >
            <span className="text-2xl leading-none" aria-hidden>
              {badge.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {badge.name}
                {!earnedAt && <span className="sr-only">（未獲得）</span>}
              </p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
              {earnedAt && (
                <p className="text-xs text-muted-foreground mt-1">{earnedAt.toLocaleDateString("ja-JP")} 獲得</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
