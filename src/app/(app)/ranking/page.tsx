import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { RANKING_PERIODS, getRanking, type Ranking, type RankingPeriod } from "@/lib/server/ranking";
import { getCurrentUserId, getSettings } from "@/lib/server/user";
import { cn } from "@/lib/utils";
import { Crown, Flame, Medal, Star, TrendingUp, Trophy, Zap } from "lucide-react";
import { RankingOptInButton } from "./ranking-opt-in-button";

const PERIOD_LABELS: Record<RankingPeriod, { tab: string; title: string; description: string }> = {
  weekly: { tab: "週間", title: "週間ランキング", description: "今週（月曜〜）のXP獲得量" },
  monthly: { tab: "月間", title: "月間ランキング", description: "今月のXP獲得量" },
  alltime: { tab: "全期間", title: "全期間ランキング", description: "累計XP" },
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
        <Crown className="h-4 w-4 text-yellow-500" aria-label="1位" />
      </div>
    );
  if (rank <= 3)
    return (
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          rank === 2 ? "bg-gray-400/20" : "bg-amber-600/20"
        )}
      >
        <Medal className={cn("h-4 w-4", rank === 2 ? "text-gray-400" : "text-amber-600")} aria-label={`${rank}位`} />
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
      <span className="text-sm font-bold text-muted-foreground">{rank}</span>
    </div>
  );
}

function RankingList({ ranking }: { ranking: Ranking }) {
  if (ranking.entries.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        この期間にXPを獲得した参加者はまだいません。最初のランカーになりましょう！
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {ranking.entries.map((user) => (
        <li
          key={user.userId}
          className={cn(
            "flex items-center justify-between p-4 rounded-lg transition-colors",
            user.isCurrentUser && "ring-2 ring-primary/40",
            user.rank <= 3 ? "bg-gradient-to-r from-muted/80 to-muted/40" : "hover:bg-muted/50"
          )}
        >
          <div className="flex items-center gap-4 min-w-0">
            <RankBadge rank={user.rank} />
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage src={user.image ?? undefined} alt="" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">
                {user.name}
                {user.isCurrentUser && <span className="ml-2 text-xs text-primary">（あなた）</span>}
              </p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Flame className="h-3 w-3 text-orange-500" aria-hidden />
                <span>{user.streak}日連続</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-500" aria-hidden />
              {user.xp.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">XP</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

interface Props {
  searchParams: Promise<{ period?: string }>;
}

export default async function RankingPage({ searchParams }: Props) {
  const { period: periodParam } = await searchParams;
  const period = RANKING_PERIODS.find((p) => p === periodParam) ?? "weekly";
  const userId = await getCurrentUserId();
  const [ranking, settings] = await Promise.all([
    getRanking(period, userId),
    userId ? getSettings(userId) : Promise.resolve(null),
  ]);
  const labels = PERIOD_LABELS[period];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-yellow-500" aria-hidden />
          </span>
          ランキング
        </h1>
        <p className="text-muted-foreground mt-2">
          XPランキング（参加は任意です。参加を選んだ {ranking.participants} 人を集計しています）
        </p>
      </div>

      {/* Your Rank */}
      <Card className="relative overflow-hidden border-primary/20">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-500/10 via-cyan-500/5 to-transparent rounded-bl-full" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-blue-500" aria-hidden />
            あなたの順位（{labels.tab}）
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!userId ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-muted-foreground">サインインするとランキングに参加できます。</p>
              <Link href="/auth/signin" className={buttonVariants()}>
                サインイン
              </Link>
            </div>
          ) : !settings?.rankingOptIn ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-muted-foreground">
                ランキングに参加していません。参加すると表示名・アバター・XPが他のユーザーに表示されます。
              </p>
              <RankingOptInButton />
            </div>
          ) : ranking.currentUser ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-primary">#{ranking.currentUser.rank}</div>
                <div>
                  <p className="font-bold text-xl flex items-center gap-1">
                    <Zap className="h-5 w-5 text-yellow-500" aria-hidden />
                    {ranking.currentUser.xp.toLocaleString()} XP
                  </p>
                  {ranking.currentUser.xpToNextRank !== null && (
                    <p className="text-sm text-muted-foreground">
                      次の順位まであと{" "}
                      <span className="text-primary font-medium">
                        {ranking.currentUser.xpToNextRank.toLocaleString()} XP
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1">
                <Flame className="h-3 w-3" aria-hidden />
                {ranking.currentUser.streak}日連続
              </Badge>
            </div>
          ) : (
            <p className="text-muted-foreground">
              この期間はまだXPを獲得していません。問題を解いてランクインしましょう！
            </p>
          )}
        </CardContent>
      </Card>

      <nav aria-label="集計期間">
        <ul className="inline-flex gap-1 p-1 rounded-lg bg-muted/50">
          {RANKING_PERIODS.map((p) => (
            <li key={p}>
              <Link
                href={`/ranking?period=${p}`}
                aria-current={p === period ? "page" : undefined}
                className={cn(
                  "inline-flex rounded-md px-4 py-1.5 text-sm transition-colors",
                  p === period ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {PERIOD_LABELS[p].tab}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {period === "alltime" ? (
              <Trophy className="h-5 w-5" aria-hidden />
            ) : (
              <TrendingUp className="h-5 w-5" aria-hidden />
            )}
            {labels.title}
          </CardTitle>
          <CardDescription>{labels.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <RankingList ranking={ranking} />
        </CardContent>
      </Card>
    </div>
  );
}
