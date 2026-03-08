import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // ゲストモードを許可するため、認証は強制しない
  // 認証チェックが必要な場合は、各ページのServer Componentで行う
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
