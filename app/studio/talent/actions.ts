"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveTalent(talentId: string): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("talent_saves").insert({
    studio_id: user.id,
    talent_id: talentId,
  });

  // ignore duplicate (already saved)
  if (error && !error.message.includes("duplicate")) {
    return { error: error.message };
  }

  revalidatePath(`/studio/talent/${talentId}`);
  revalidatePath("/studio/dashboard");
  return { ok: true };
}

export async function unsaveTalent(talentId: string): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("talent_saves")
    .delete()
    .eq("studio_id", user.id)
    .eq("talent_id", talentId);

  if (error) return { error: error.message };

  revalidatePath(`/studio/talent/${talentId}`);
  revalidatePath("/studio/dashboard");
  return { ok: true };
}
