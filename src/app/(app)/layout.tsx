import Link from "next/link";
import { auth } from "@/lib/auth";
import { Navigation } from "@/components/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={session?.user} />
      {!session?.user && (
        <div className="border-b bg-muted/40">
          <p className="container py-2 text-center text-sm text-muted-foreground">
            ゲストモードでお試し中です。進捗は保存されません。
            <Link href="/auth/signin" className="ml-1 font-medium text-foreground underline underline-offset-4">
              サインインして学習を記録する
            </Link>
          </p>
        </div>
      )}
      <main id="main-content" className="container py-6">
        {children}
      </main>
    </div>
  );
}
