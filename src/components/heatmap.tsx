import { cn } from "@/lib/utils";

const LEVEL_CLASSES = [
  "bg-muted",
  "bg-green-200 dark:bg-green-900",
  "bg-green-300 dark:bg-green-800",
  "bg-green-400 dark:bg-green-700",
  "bg-green-500 dark:bg-green-600",
];

function intensity(count: number, max: number): number {
  if (count === 0 || max === 0) return 0;
  return Math.min(4, Math.ceil((count / max) * 4));
}

/** GitHub風の学習カレンダー（列 = 週、行 = 曜日） */
export function Heatmap({ days }: { days: { date: string; count: number }[] }) {
  if (days.length === 0) return null;
  const max = Math.max(...days.map((d) => d.count));

  // 先頭を日曜始まりの週にそろえる
  const [y, m, d] = days[0].date.split("-").map(Number);
  const leadingBlanks = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const cells: ({ date: string; count: number } | null)[] = [...Array(leadingBlanks).fill(null), ...days];
  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const total = days.reduce((sum, day) => sum + day.count, 0);
  const activeDays = days.filter((day) => day.count > 0).length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        過去{days.length}日間で {total.toLocaleString()} 回答（{activeDays}日学習）
      </p>
      <div className="overflow-x-auto pb-2">
        <div
          className="flex gap-[3px] w-max"
          role="img"
          aria-label={`学習カレンダー: 過去${days.length}日間で${total}回答`}
        >
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) =>
                day ? (
                  <div
                    key={day.date}
                    className={cn("w-3 h-3 rounded-sm", LEVEL_CLASSES[intensity(day.count, max)])}
                    title={`${day.date}: ${day.count}回答`}
                  />
                ) : (
                  <div key={`blank-${di}`} className="w-3 h-3" />
                )
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {LEVEL_CLASSES.map((cls) => (
            <div key={cls} className={cn("w-3 h-3 rounded-sm", cls)} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
