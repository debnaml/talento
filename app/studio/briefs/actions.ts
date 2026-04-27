"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type BriefInsert = Database["public"]["Tables"]["casting_briefs"]["Insert"];
type BriefUpdate = Database["public"]["Tables"]["casting_briefs"]["Update"];
type TalentCategory = Database["public"]["Enums"]["talent_category"];
type GenderIdentity = Database["public"]["Enums"]["gender_identity"];
type BriefStatus = Database["public"]["Enums"]["brief_status"];

function parseInt0(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function parseStr(v: FormDataEntryValue | null): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function parseBool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true";
}

function parseGender(v: FormDataEntryValue | null): GenderIdentity | null {
  const s = parseStr(v);
  if (!s) return null;
  const allowed: GenderIdentity[] = [
    "male",
    "female",
    "non_binary",
    "other",
    "prefer_not",
  ];
  return (allowed as string[]).includes(s) ? (s as GenderIdentity) : null;
}

function parseStatus(v: FormDataEntryValue | null): BriefStatus | null {
  const s = parseStr(v);
  if (!s) return null;
  const allowed: BriefStatus[] = ["draft", "open", "closed", "cancelled"];
  return (allowed as string[]).includes(s) ? (s as BriefStatus) : null;
}

function parseCategories(fd: FormData): TalentCategory[] {
  const all = fd.getAll("categories").map(String) as TalentCategory[];
  const valid: TalentCategory[] = [
    "film", "tv", "advertising", "gaming", "d2c", "sports", "music",
    "historical", "stunt", "action", "drama", "comedy",
  ];
  return all.filter((c) => (valid as string[]).includes(c));
}

function payloadFromForm(fd: FormData) {
  return {
    title: parseStr(fd.get("title")) ?? "",
    description: parseStr(fd.get("description")),
    categories: parseCategories(fd),
    gender: parseGender(fd.get("gender")),
    age_range: parseStr(fd.get("age_range")),
    country: parseStr(fd.get("country")),
    height_min_cm: parseInt0(fd.get("height_min_cm")),
    height_max_cm: parseInt0(fd.get("height_max_cm")),
    requires_video: parseBool(fd.get("requires_video")),
    requires_voice: parseBool(fd.get("requires_voice")),
    requires_verified: parseBool(fd.get("requires_verified")),
    budget_gbp_min: parseInt0(fd.get("budget_gbp_min")),
    budget_gbp_max: parseInt0(fd.get("budget_gbp_max")),
    usage_scope: parseStr(fd.get("usage_scope")),
    shoot_date: parseStr(fd.get("shoot_date")),
  };
}

export async function createBrief(fd: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const base = payloadFromForm(fd);
  if (!base.title) return { error: "Title is required" };

  const status = parseStatus(fd.get("status")) ?? "draft";

  const insert: BriefInsert = { ...base, studio_id: user.id, status };

  const { data, error } = await supabase
    .from("casting_briefs")
    .insert(insert)
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Failed to create brief" };

  revalidatePath("/studio/briefs");
  redirect(`/studio/briefs/${data.id}`);
}

export async function updateBrief(id: string, fd: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const base = payloadFromForm(fd);
  if (!base.title) return { error: "Title is required" };

  const status = parseStatus(fd.get("status"));

  const update: BriefUpdate = { ...base, ...(status ? { status } : {}) };

  const { error } = await supabase
    .from("casting_briefs")
    .update(update)
    .eq("id", id)
    .eq("studio_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/studio/briefs");
  revalidatePath(`/studio/briefs/${id}`);
  return { ok: true };
}

export async function setBriefStatus(id: string, status: BriefStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("casting_briefs")
    .update({ status })
    .eq("id", id)
    .eq("studio_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/studio/briefs");
  revalidatePath(`/studio/briefs/${id}`);
  return { ok: true };
}

export async function deleteBrief(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("casting_briefs")
    .delete()
    .eq("id", id)
    .eq("studio_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/studio/briefs");
  redirect("/studio/briefs");
}

export async function inviteTalent(briefId: string, talentId: string, note?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // RLS double-checks studio ownership; select the brief to confirm
  const { data: brief } = await supabase
    .from("casting_briefs")
    .select("id, status")
    .eq("id", briefId)
    .eq("studio_id", user.id)
    .maybeSingle();
  if (!brief) return { error: "Brief not found" };

  const { error } = await supabase
    .from("brief_invites")
    .upsert(
      {
        brief_id: briefId,
        talent_id: talentId,
        note: note ?? null,
        status: "pending",
      },
      { onConflict: "brief_id,talent_id", ignoreDuplicates: true },
    );

  if (error) return { error: error.message };

  revalidatePath(`/studio/briefs/${briefId}`);
  return { ok: true };
}

export async function uninviteTalent(briefId: string, talentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("brief_invites")
    .delete()
    .eq("brief_id", briefId)
    .eq("talent_id", talentId);

  if (error) return { error: error.message };

  revalidatePath(`/studio/briefs/${briefId}`);
  return { ok: true };
}
