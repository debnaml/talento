import { createClient } from "@/lib/supabase/server";

/**
 * Returns the set of user IDs the current user has blocked OR been blocked by.
 * Use to filter lists of talent/studio profiles.
 */
export async function getBlockedUserIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from("user_blocks")
    .select("blocker_id, blocked_id")
    .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

  const set = new Set<string>();
  for (const row of data ?? []) {
    if (row.blocker_id === user.id) set.add(row.blocked_id);
    else set.add(row.blocker_id);
  }
  return set;
}

export async function isBlocked(
  currentUserId: string,
  otherUserId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_blocks")
    .select("blocker_id")
    .or(
      `and(blocker_id.eq.${currentUserId},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${currentUserId})`,
    )
    .limit(1)
    .maybeSingle();
  return !!data;
}
