import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasAdminAccess } from "@/lib/admin-auth";
import { createMiddlewareClient } from "@/lib/supabase-server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return response;
  }

  const supabase = createMiddlewareClient(request, response);
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  const isAdmin = hasAdminAccess(session);

  if (!session && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (session && !isAdmin && !isLoginPage) {
    const loginUrl = new URL("/admin/login?denied=1", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isAdmin && isLoginPage) {
    const dashboardUrl = new URL("/admin", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"]
};
