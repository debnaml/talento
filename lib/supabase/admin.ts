import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Bypasses RLS. Use ONLY in server actions that need elevated permissions
// (e.g. generating signed URLs for the public registry).
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client.
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
