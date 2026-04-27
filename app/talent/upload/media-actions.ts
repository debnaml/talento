"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type Result = { ok?: boolean; error?: string };

export async function deleteMedia(
  mediaId: string,
  storagePath: string,
  kind: "video" | "voice"
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const bucket = kind === "video" ? "talent-video" : "talent-voice";

  await supabase.storage.from(bucket).remove([storagePath]);

  const { error } = await supabase
    .from("talent_media")
    .delete()
    .eq("id", mediaId)
    .eq("talent_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/talent/upload");
  return { ok: true };
}

export async function updateMediaLabel(
  mediaId: string,
  label: string
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const trimmed = label.trim().slice(0, 40);

  const { error } = await supabase
    .from("talent_media")
    .update({ label: trimmed || null })
    .eq("id", mediaId)
    .eq("talent_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/talent/upload");
  return { ok: true };
}
