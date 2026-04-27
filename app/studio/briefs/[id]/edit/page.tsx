import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BriefForm } from "@/components/forms/BriefForm";
import { updateBrief } from "../../actions";

export default async function EditBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brief } = await supabase
    .from("casting_briefs")
    .select("*")
    .eq("id", id)
    .eq("studio_id", user.id)
    .maybeSingle();
  if (!brief) notFound();

  async function save(fd: FormData) {
    "use server";
    return updateBrief(id, fd);
  }

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[680px] mx-auto">
        <div className="mb-10">
          <Link
            href={`/studio/briefs/${id}`}
            className="inline-flex items-center gap-1.5 font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-orange transition-colors no-underline mb-4"
          >
            ← Back to brief
          </Link>
          <h1 className="font-display text-[clamp(36px,5vw,56px)] tracking-[2px] text-warm-white leading-none">
            EDIT BRIEF
          </h1>
        </div>
        <BriefForm
          mode="edit"
          initial={{
            id: brief.id,
            title: brief.title,
            description: brief.description,
            categories: brief.categories ?? [],
            gender: brief.gender,
            age_range: brief.age_range,
            country: brief.country,
            height_min_cm: brief.height_min_cm,
            height_max_cm: brief.height_max_cm,
            requires_video: brief.requires_video,
            requires_voice: brief.requires_voice,
            requires_verified: brief.requires_verified,
            budget_gbp_min: brief.budget_gbp_min,
            budget_gbp_max: brief.budget_gbp_max,
            usage_scope: brief.usage_scope,
            shoot_date: brief.shoot_date,
            status: brief.status,
          }}
          action={save}
        />
      </div>
    </div>
  );
}
