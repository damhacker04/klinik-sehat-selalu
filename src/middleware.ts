import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROLE_DASHBOARD_ROUTES } from "@/lib/constants";

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/reset-password", "/reset-password/confirm", "/auth/callback"];

// Role-based route access mapping
const roleRouteAccess: Record<string, string[]> = {
  pasien: ["/pasien"],
  admin: ["/admin"],
  perawat: ["/perawat"],
  dokter: ["/dokter"],
  apoteker: ["/apoteker"],
  kasir: ["/kasir"],
};

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = request.nextUrl;

  // Handle Supabase auth code exchange (password reset, email confirm, etc.)
  const code = searchParams.get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/reset-password/confirm";
      redirectUrl.searchParams.delete("code");
      redirectUrl.searchParams.delete("next");
      const redirectResponse = NextResponse.redirect(redirectUrl);
      // Transfer session cookies from supabaseResponse to redirect response
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
  }

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route)) {
    // Redirect authenticated users away from auth pages to their dashboard
    if (user && ["/login", "/register"].includes(pathname)) {
      const { data: account } = await supabase
        .from("user_accounts")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = account?.role || "pasien";
      const dashboardRoute = ROLE_DASHBOARD_ROUTES[role] || "/pasien";
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    }
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // RBAC: Check role-based access
  const { data: account } = await supabase
    .from("user_accounts")
    .select("role, status")
    .eq("id", user.id)
    .single();

  const role = account?.role || "pasien";
  const status = account?.status || "active";

  // Block suspended/inactive users
  if (status !== "active") {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "account_suspended");
    return NextResponse.redirect(url);
  }

  // Check if user has access to the requested route
  const allowedRoutes = roleRouteAccess[role] || [];
  const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

  if (!hasAccess && pathname !== "/") {
    // Redirect to their own dashboard
    const dashboardRoute = ROLE_DASHBOARD_ROUTES[role] || "/pasien";
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes - handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
