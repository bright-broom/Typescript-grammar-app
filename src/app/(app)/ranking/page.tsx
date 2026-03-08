import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Flame,
  TrendingUp,
  Crown,
  Star,
  Zap,
} from "lucide-react";

// モックデータ
const mockRanking = [
  { rank: 1, name: "TypeMaster", xp: 12500, streak: 45, avatar: null },
  { rank: 2, name: "GenericsGuru", xp: 11200, streak: 32, avatar: null },
  { rank: 3, name: "InferWizard", xp: 10800, streak: 28, avatar: null },
  { rank: 4, name: "MappedMaster", xp: 9500, streak: 21, avatar: null },
  { rank: 5, name: "UnionExpert", xp: 8900, streak: 19, avatar: null },
  { rank: 6, name: "TupleTamer", xp: 8200, streak: 15, avatar: null },
  { rank: 7, name: "ConditionalPro", xp: 7800, streak: 14, avatar: null },
  { rank: 8, name: "UtilityUser", xp: 7200, streak: 12, avatar: null },
  { rank: 9, name: "TypeNewbie", xp: 6500, streak: 10, avatar: null },
  { rank: 10, name: "TSLearner", xp: 5800, streak: 7, avatar: null },
];

function getRankBadge(rank: number) {
  if (rank === 1)
    return (
      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
        <Crown className="h-4 w-4 text-yellow-500" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-8 h-8 rounded-full bg-gray-400/20 flex items-center justify-center">
        <Medal className="h-4 w-4 text-gray-400" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center">
        <Medal className="h-4 w-4 text-amber-600" />
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
      <span className="text-sm font-bold text-muted-foreground">{rank}</span>
    </div>
  );
}

function RankingList({ data }: { data: typeof mockRanking }) {
  return (
    <div className="space-y-2">
      {data.map((user, index) => (
        <div
          key={user.rank}
          className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
            user.rank <= 3
              ? "bg-gradient-to-r from-muted/80 to-muted/40"
              : "hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center gap-4">
            {getRankBadge(user.rank)}
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Flame className="h-3 w-3 text-orange-500" />
                <span>{user.streak}日連続</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              {user.xp.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">XP</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RankingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
          ランキング
        </h1>
        <p className="text-muted-foreground mt-2">
          XPランキングを確認しましょう
        </p>
      </div>

      {/* Your Rank */}
      <Card className="relative overflow-hidden border-primary/20">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-500/10 via-cyan-500/5 to-transparent rounded-bl-full" />
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-blue-500" />
            あなたの順位
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary">#42</div>
              <div>
                <p className="font-bold text-xl flex items-center gap-1">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  1,250 XP
                </p>
                <p className="text-sm text-muted-foreground">
                  次の順位まであと <span className="text-primary font-medium">150 XP</span>
                </p>
              </div>
            </div>
            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1">
              <Flame className="h-3 w-3" />
              5日連続
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="weekly" className="gap-2">
            週間
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-2">
            月間
          </TabsTrigger>
          <TabsTrigger value="alltime" className="gap-2">
            全期間
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                週間ランキング
              </CardTitle>
              <CardDescription>今週のXP獲得量</CardDescription>
            </CardHeader>
            <CardContent>
              <RankingList data={mockRanking} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                月間ランキング
              </CardTitle>
              <CardDescription>今月のXP獲得量</CardDescription>
            </CardHeader>
            <CardContent>
              <RankingList data={mockRanking} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alltime">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                全期間ランキング
              </CardTitle>
              <CardDescription>累計XP</CardDescription>
            </CardHeader>
            <CardContent>
              <RankingList data={mockRanking} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
