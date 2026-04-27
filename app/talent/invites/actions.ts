"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function respond(briefId: string, status: "accepted" | "declined") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("brief_invites")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("brief_id", briefId)
    .eq("talent_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/talent/invites");
  revalidatePath(`/talent/invites/${briefId}`);
  return { ok: true };
}

export async function acceptInvite(briefId: string) {
  return respond(briefId, "accepted");
}

export async function declineInvite(briefId: string) {
  return respond(briefId, "declined");
}
