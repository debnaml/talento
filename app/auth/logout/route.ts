import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

async function signOutAndRedirect(request: NextRequest) {
  // Build the redirect response up-front so we can attach the Supabase
  // sign-out cookies (deletion markers) directly to it. Returning an
  // explicit NextResponse bypasses the Next.js next/headers cookie merge,
  // so the cookies MUST be set on `response` itself for logout to stick.
  const response = NextResponse.redirect(new URL("/", request.url), {
    status: 303,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.signOut();

  return response;
}

export async function POST(request: NextRequest) {
  return signOutAndRedirect(request);
}

// Allow GET as a fallback (useful for manual links / dev testing).
export async function GET(request: NextRequest) {
  return signOutAndRedirect(request);
}
