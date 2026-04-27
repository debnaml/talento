import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
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

  // Refresh session — MUST call getUser() to keep session alive
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect talent + studio routes
  const isProtected =
    pathname.startsWith("/talent") || pathname.startsWith("/studio");

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect signed-in users away from auth pages
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    // Send them to their role-appropriate destination
    const role = user.user_metadata?.role as string | undefined;
    url.pathname = role === "studio" ? "/studio/dashboard" : "/talent/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// Only run on auth-relevant routes. Public marketing pages (/, /about,
// /become-talent, /for-studios, /auctions) and static assets are skipped,
// saving the ~100ms Supabase round-trip on every request.
export const config = {
  matcher: [
    "/talent/:path*",
    "/studio/:path*",
    "/login",
    "/register",
    "/auth/:path*",
  ],
};
