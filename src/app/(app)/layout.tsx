import { auth } from "@/lib/auth";
import { Navigation } from "@/components/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={session?.user} />
      <main className="container py-6">{children}</main>
    </div>
  );
}
