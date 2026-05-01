import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STATUS_COLORS: Record<string, string> = {
  pending: "text-orange border-orange/30",
  accepted: "text-success border-success/30",
  declined: "text-grey border-white/10",
};

export default async function TalentInvitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invites } = await supabase
    .from("brief_invites")
    .select(
      "brief_id, status, invited_at, responded_at, casting_briefs(id, title, description, status, categories, shoot_date, studio_id, studio_profiles(studio_name))",
    )
    .eq("talent_id", user.id)
    .order("invited_at", { ascending: false });

  const rows = (invites ?? []).filter((i) => i.casting_briefs);

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[820px] mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-6 h-0.5 bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              Inbox
            </span>
          </div>
          <h1 className="font-display text-[clamp(32px,4vw,52px)] tracking-[2px] text-warm-white leading-none">
            BRIEF INVITES
          </h1>
          <p className="font-body text-[14px] font-light text-grey mt-3">
            Studios that invited you to a casting brief.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="bg-dark-3 p-10 text-center">
            <p className="font-body text-[14px] font-light text-silver">
              No invites yet. Make sure your profile is published so studios can find you.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {rows.map((i) => {
              const brief = i.casting_briefs!;
              // Supabase returns single-record joins as an object when FK is unique
              const studioName =
                (brief.studio_profiles as { studio_name?: string } | null)?.studio_name ??
                "Studio";
              return (
                <Link
                  key={i.brief_id}
                  href={`/talent/invites/${i.brief_id}`}
                  className="bg-dark-3 hover:bg-dark-2 transition-colors p-6 flex items-start justify-between gap-4 no-underline"
                >
                  <div className="min-w-0">
                    <div className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey mb-1.5">
                      {studioName}
                    </div>
                    <div className="font-display text-[22px] tracking-[1px] text-warm-white leading-none mb-2">
                      {brief.title.toUpperCase()}
                    </div>
                    {brief.description && (
                      <p className="font-body text-[13px] font-light text-silver line-clamp-2 leading-snug">
                        {brief.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`font-condensed text-[10px] font-bold uppercase tracking-[2px] px-2.5 py-1 border ${STATUS_COLORS[i.status] ?? "text-grey border-white/10"} shrink-0`}
                  >
                    {i.status}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
