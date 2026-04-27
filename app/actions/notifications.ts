"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Mark notifications as read. Safe to call from both server actions
 * (form submissions) and during render (e.g. on page load). When
 * `revalidate` is false, we skip revalidatePath — Next.js forbids
 * calling it during render.
 */
export async function markNotificationsRead(
  ids?: string[],
  options: { revalidate?: boolean } = {},
) {
  const { revalidate = true } = options;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const q = supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (ids && ids.length) {
    await q.in("id", ids);
  } else {
    await q;
  }

  if (revalidate) {
    revalidatePath("/talent/notifications");
    revalidatePath("/studio/notifications");
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);
  return count ?? 0;
}
