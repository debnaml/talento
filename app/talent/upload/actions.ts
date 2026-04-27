"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);
  if (base.length < 3) return `talent-${Math.random().toString(36).slice(2, 7)}`;
  return base;
}

async function findAvailableUsername(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  base: string,
): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const { data } = await supabase
      .from("talent_profiles")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function publishProfile(): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { count } = await supabase
    .from("talent_images")
    .select("*", { count: "exact", head: true })
    .eq("talent_id", user.id);

  if ((count ?? 0) < 1) {
    return { error: "Upload at least one image before publishing." };
  }

  // Auto-generate a username from stage_name on first publish if not set.
  const { data: existing } = await supabase
    .from("talent_profiles")
    .select("username, stage_name")
    .eq("id", user.id)
    .single();

  const updates: { published: boolean; username?: string } = { published: true };

  if (existing && !existing.username) {
    const base = slugify(existing.stage_name || "talent");
    const username = await findAvailableUsername(supabase, base);
    updates.username = username;
  }

  const { error } = await supabase
    .from("talent_profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/talent/dashboard");
  revalidatePath("/talent/upload");
  return { ok: true };
}

export async function unpublishProfile(): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("talent_profiles")
    .update({ published: false })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/talent/dashboard");
  revalidatePath("/talent/upload");
  return { ok: true };
}

export async function setPrimaryImage(imageId: string): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Unset all primaries for this talent, then set the new one
  await supabase
    .from("talent_images")
    .update({ is_primary: false })
    .eq("talent_id", user.id);

  const { error } = await supabase
    .from("talent_images")
    .update({ is_primary: true })
    .eq("id", imageId)
    .eq("talent_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/talent/upload");
  return { ok: true };
}

export async function deleteImage(imageId: string, storagePath: string): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase.storage.from("talent-images").remove([storagePath]);

  const { error } = await supabase
    .from("talent_images")
    .delete()
    .eq("id", imageId)
    .eq("talent_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/talent/upload");
  return { ok: true };
}
