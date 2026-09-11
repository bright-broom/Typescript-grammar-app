import { NextResponse, type NextRequest } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** 認証は強制しない（ゲストモードを許可するため、必要な画面・APIごとに判定する） */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CSRF対策: 状態を変更するAPIは同一オリジンからのリクエストのみ受け付ける
  // （NextAuth は独自のCSRFトークン、cron は Bearer トークンで保護している）
  if (
    pathname.startsWith("/api/") &&
    !SAFE_METHODS.has(request.method) &&
    !pathname.startsWith("/api/auth/") &&
    !pathname.startsWith("/api/cron/") &&
    isCrossSite(request)
  ) {
    return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
  }

  return NextResponse.next();
}

function isCrossSite(request: NextRequest): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return true;

  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
