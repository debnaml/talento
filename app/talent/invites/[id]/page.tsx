import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { acceptInvite, declineInvite } from "../actions";
import { openAndRedirect } from "@/app/actions/messaging";
import { blockUser } from "@/app/actions/blocks";

const CATEGORY_LABELS: Record<string, string> = {
  film: "Film", tv: "TV", advertising: "Advertising", gaming: "Gaming",
  d2c: "D2C", sports: "Sports", music: "Music", historical: "Historical",
  stunt: "Stunt", action: "Action", drama: "Drama", comedy: "Comedy",
};

export default async function InviteDetailPage({
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

  const { data: invite } = await supabase
    .from("brief_invites")
    .select("brief_id, status, note, invited_at, responded_at")
    .eq("brief_id", id)
    .eq("talent_id", user.id)
    .maybeSingle();
  if (!invite) notFound();

  const { data: brief } = await supabase
    .from("casting_briefs")
    .select(
      "id, studio_id, title, description, status, categories, gender, age_range, country, height_min_cm, height_max_cm, budget_gbp_min, budget_gbp_max, usage_scope, shoot_date, studio_profiles(studio_name)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!brief) notFound();

  const studioName =
    (brief.studio_profiles as { studio_name?: string } | null)?.studio_name ?? "Studio";

  const target = [
    brief.gender,
    brief.age_range,
    brief.country,
    brief.height_min_cm || brief.height_max_cm
      ? `${brief.height_min_cm ?? "?"}–${brief.height_max_cm ?? "?"} cm`
      : null,
  ].filter(Boolean).join(" · ");

  const budget =
    brief.budget_gbp_min || brief.budget_gbp_max
      ? `£${brief.budget_gbp_min ?? "?"}–£${brief.budget_gbp_max ?? "?"}`
      : null;

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[720px] mx-auto">
        <div className="mb-6">
          <Link
            href="/talent/invites"
            className="inline-flex items-center gap-1.5 font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-orange transition-colors no-underline"
          >
            ← Invites
          </Link>
        </div>

        <div className="bg-dark-3 border-t-2 border-orange p-8 mb-0.5">
          <div className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey mb-2">
            {studioName}
          </div>
          <h1 className="font-display text-[clamp(32px,4vw,52px)] tracking-[2px] text-warm-white leading-none mb-5">
            {brief.title.toUpperCase()}
          </h1>

          {brief.description && (
            <p className="font-body text-[14px] font-light text-silver leading-relaxed whitespace-pre-wrap mb-5">
              {brief.description}
            </p>
          )}

          {brief.categories && brief.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(brief.categories as string[]).map((c) => (
                <span
                  key={c}
                  className="font-condensed text-[10px] font-bold uppercase tracking-[1.5px] px-2.5 py-1 border border-orange/30 text-orange"
                >
                  {CATEGORY_LABELS[c] ?? c}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-dark-3 p-7 mb-0.5">
          <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange mb-4">
            Details
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["Target", target],
              ["Budget", budget],
              ["Usage scope", brief.usage_scope],
              ["Shoot date", brief.shoot_date],
            ]
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label}>
                  <div className="font-condensed text-[9px] font-bold uppercase tracking-[2px] text-grey mb-0.5">
                    {label}
                  </div>
                  <div className="font-condensed text-[13px] text-warm-white tracking-[0.5px]">
                    {String(value)}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-dark-3 p-7">
          <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange mb-4">
            Your response
          </div>

          {invite.status === "pending" ? (
            <div className="flex items-center gap-2">
              <form action={async () => { "use server"; await acceptInvite(id); }}>
                <button
                  type="submit"
                  className="font-condensed text-[13px] font-bold uppercase tracking-[2px] px-6 py-3 bg-orange text-white hover:bg-orange-hot transition-colors"
                >
                  Accept invite
                </button>
              </form>
              <form action={async () => { "use server"; await declineInvite(id); }}>
                <button
                  type="submit"
                  className="font-condensed text-[13px] font-bold uppercase tracking-[2px] px-6 py-3 border border-white/15 text-silver hover:border-orange hover:text-orange transition-colors"
                >
                  Decline
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`font-condensed text-[11px] font-bold uppercase tracking-[2px] px-3 py-1 border ${
                  invite.status === "accepted"
                    ? "text-success border-success/30"
                    : "text-grey border-white/10"
                }`}
              >
                {invite.status}
              </span>
              {invite.status === "accepted" && (
                <>
                  <form
                    action={async () => {
                      "use server";
                      await openAndRedirect(brief.studio_id, brief.id, "talent");
                    }}
                  >
                    <button
                      type="submit"
                      className="font-condensed text-[11px] font-bold uppercase tracking-[2px] px-3 py-1.5 border border-orange text-orange hover:bg-orange hover:text-white transition-colors"
                    >
                      Message studio
                    </button>
                  </form>
                  <form action={async () => { "use server"; await declineInvite(id); }}>
                    <button
                      type="submit"
                      className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-orange transition-colors"
                    >
                      Change to decline
                    </button>
                  </form>
                </>
              )}
              {invite.status === "declined" && (
                <form action={async () => { "use server"; await acceptInvite(id); }}>
                  <button
                    type="submit"
                    className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-orange transition-colors"
                  >
                    Change to accept
                  </button>
                </form>
              )}
              <form
                action={async () => {
                  "use server";
                  await blockUser(brief.studio_id);
                  redirect("/talent/invites");
                }}
              >
                <button
                  type="submit"
                  className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-orange transition-colors"
                >
                  Block studio
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
