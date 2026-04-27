"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function blockUser(
  targetId: string,
  reason?: string,
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  if (user.id === targetId) return { error: "Cannot block yourself" };

  const { error } = await supabase.from("user_blocks").upsert(
    {
      blocker_id: user.id,
      blocked_id: targetId,
      reason: reason ?? null,
    },
    { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true },
  );
  if (error) return { error: error.message };

  // Tear down any conversations between these two parties so they can't keep
  // exchanging messages. Brief invites stay as historical records.
  await supabase
    .from("conversations")
    .delete()
    .or(
      `and(studio_id.eq.${user.id},talent_id.eq.${targetId}),and(studio_id.eq.${targetId},talent_id.eq.${user.id})`,
    );

  // Also unsave if relevant (studio blocking talent or vice versa)
  await supabase
    .from("talent_saves")
    .delete()
    .or(
      `and(studio_id.eq.${user.id},talent_id.eq.${targetId}),and(studio_id.eq.${targetId},talent_id.eq.${user.id})`,
    );

  revalidatePath("/talent/dashboard");
  revalidatePath("/studio/dashboard");
  revalidatePath("/talent/settings/blocked");
  revalidatePath("/studio/settings/blocked");
  return { ok: true };
}

export async function unblockUser(
  targetId: string,
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", targetId);
  if (error) return { error: error.message };

  revalidatePath("/talent/settings/blocked");
  revalidatePath("/studio/settings/blocked");
  return { ok: true };
}
