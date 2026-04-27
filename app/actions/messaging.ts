"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Open (or resume) a conversation between the current user and the other party.
 * - If the current user is a studio: they're messaging a talent.
 * - If the current user is a talent: they're messaging a studio.
 * briefId is optional; null = general conversation.
 */
export async function openConversation(
  otherUserId: string,
  briefId?: string | null,
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!me) return { error: "Profile not found" };

  const studioId = me.role === "studio" ? user.id : otherUserId;
  const talentId = me.role === "studio" ? otherUserId : user.id;

  // Check both parties exist in their role-specific table
  const [{ data: studio }, { data: talent }] = await Promise.all([
    supabase.from("studio_profiles").select("id").eq("id", studioId).maybeSingle(),
    supabase.from("talent_profiles").select("id").eq("id", talentId).maybeSingle(),
  ]);
  if (!studio || !talent) return { error: "Other party not found" };

  // RLS enforces block-check; do a pre-check to give a friendlier error
  const { data: blockRow } = await supabase
    .from("user_blocks")
    .select("blocker_id")
    .or(
      `and(blocker_id.eq.${user.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${user.id})`,
    )
    .limit(1)
    .maybeSingle();
  if (blockRow) return { error: "Messaging not available between these users." };

  // Try to find existing convo with same (studio, talent, brief)
  let existing;
  {
    const q = supabase
      .from("conversations")
      .select("id")
      .eq("studio_id", studioId)
      .eq("talent_id", talentId);
    existing = briefId
      ? await q.eq("brief_id", briefId).maybeSingle()
      : await q.is("brief_id", null).maybeSingle();
  }
  if (existing.data) return { id: existing.data.id };

  const { data: inserted, error } = await supabase
    .from("conversations")
    .insert({
      studio_id: studioId,
      talent_id: talentId,
      brief_id: briefId ?? null,
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error || !inserted) return { error: error?.message ?? "Failed" };
  return { id: inserted.id };
}

/**
 * Server action wrapper: open (or resume) and redirect to the thread.
 * Works from a <form action=…> button on any page.
 */
export async function openAndRedirect(
  otherUserId: string,
  briefId: string | null,
  role: "studio" | "talent",
) {
  const { id, error } = await openConversation(otherUserId, briefId);
  if (error || !id) throw new Error(error ?? "Failed to open conversation");
  redirect(`/${role}/messages/${id}`);
}

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const trimmed = body.trim();
  if (!trimmed) return { error: "Message cannot be empty" };
  if (trimmed.length > 4000) return { error: "Message too long" };

  const { error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: trimmed,
    });
  if (error) return { error: error.message };

  revalidatePath(`/studio/messages/${conversationId}`);
  revalidatePath(`/talent/messages/${conversationId}`);
  revalidatePath("/studio/messages");
  revalidatePath("/talent/messages");
  return { ok: true };
}

export async function markConversationRead(conversationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .is("read_at", null)
    .neq("sender_id", user.id);
}
