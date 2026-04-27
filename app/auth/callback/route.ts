import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Redirect based on onboarding status
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarded, role")
        .eq("id", data.user.id)
        .single();

      if (!profile?.onboarded) {
        const dest =
          profile?.role === "studio"
            ? "/studio/onboarding"
            : "/talent/onboarding";
        return NextResponse.redirect(new URL(dest, origin));
      }

      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // Auth failed — back to login with error
  return NextResponse.redirect(new URL("/login?error=auth_failed", origin));
}
