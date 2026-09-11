import Link from "next/link";
import { LogIn } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";

/** ゲストに表示する「サインインすると使える機能」の案内 */
export function SignInPrompt({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <LogIn className="h-6 w-6 text-muted-foreground" aria-hidden />
        </div>
        <div className="space-y-1">
          <h2 className="font-semibold text-lg">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/auth/signin" className={buttonVariants()}>
            サインイン
          </Link>
          <Link href="/practice/free" className={buttonVariants({ variant: "outline" })}>
            ゲストとして問題を解く
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
