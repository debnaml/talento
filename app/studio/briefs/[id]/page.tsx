import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { inviteTalent, setBriefStatus, uninviteTalent, deleteBrief } from "../actions";
import { getBlockedUserIds } from "@/lib/blocks";

const CATEGORY_LABELS: Record<string, string> = {
  film: "Film", tv: "TV", advertising: "Advertising", gaming: "Gaming",
  d2c: "D2C", sports: "Sports", music: "Music", historical: "Historical",
  stunt: "Stunt", action: "Action", drama: "Drama", comedy: "Comedy",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "text-grey border-grey/30",
  open: "text-green-400 border-green-500/30",
  closed: "text-silver border-white/10",
  cancelled: "text-grey border-white/10",
};

type MatchRow = {
  id: string;
  stage_name: string;
  username: string | null;
  location: string | null;
  country: string | null;
  gender: string | null;
  age_range: string | null;
  height_cm: number | null;
  categories: string[] | null;
  verified: boolean | null;
  primary_storage_path: string | null;
};

export default async function BriefDetailPage({
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

  const { data: matchesRaw } = await supabase.rpc("match_talent_for_brief", {
    p_brief_id: id,
  });
  const blocked = await getBlockedUserIds();
  const matches = ((matchesRaw ?? []) as unknown as MatchRow[]).filter(
    (m) => !blocked.has(m.id),
  );

  const { data: invites } = await supabase
    .from("brief_invites")
    .select("talent_id, status, invited_at, responded_at")
    .eq("brief_id", id);

  const invitedMap = new Map<string, { status: string }>();
  (invites ?? []).forEach((i) => invitedMap.set(i.talent_id, { status: i.status }));

  const invitedIds = Array.from(invitedMap.keys());
  const invitedTalents = invitedIds.length
    ? (
        await supabase
          .from("talent_profiles")
          .select(
            "id, stage_name, username, location, country, categories, talent_images(storage_path, is_primary)",
          )
          .in("id", invitedIds)
      ).data ?? []
    : [];

  // Sign all primary image URLs
  const pathsToSign = new Set<string>();
  matches.forEach((m) => m.primary_storage_path && pathsToSign.add(m.primary_storage_path));
  invitedTalents.forEach((t) => {
    const imgs = Array.isArray(t.talent_images) ? t.talent_images : [];
    const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
    if (primary) pathsToSign.add(primary.storage_path);
  });

  const signed: Record<string, string> = {};
  await Promise.all(
    Array.from(pathsToSign).map(async (p) => {
      const { data } = await supabase.storage.from("talent-images").createSignedUrl(p, 3600);
      if (data?.signedUrl) signed[p] = data.signedUrl;
    }),
  );

  const notInvitedMatches = matches.filter((m) => !invitedMap.has(m.id));

  const meta = [
    brief.gender,
    brief.age_range,
    brief.country,
    brief.height_min_cm || brief.height_max_cm
      ? `${brief.height_min_cm ?? "?"}–${brief.height_max_cm ?? "?"} cm`
      : null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-6">
          <Link
            href="/studio/briefs"
            className="inline-flex items-center gap-1.5 font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-orange transition-colors no-underline"
          >
            ← Briefs
          </Link>
        </div>

        {/* Header */}
        <div className="bg-dark-3 border-t-2 border-orange p-8 mb-0.5">
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2.5 mb-3">
                <div className="w-6 h-0.5 bg-orange" />
                <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
                  Brief
                </span>
              </div>
              <h1 className="font-display text-[clamp(32px,4vw,52px)] tracking-[2px] text-warm-white leading-none">
                {brief.title.toUpperCase()}
              </h1>
            </div>
            <span
              className={`font-condensed text-[10px] font-bold uppercase tracking-[2px] px-2.5 py-1 border ${STATUS_COLORS[brief.status] ?? ""} shrink-0`}
            >
              {brief.status}
            </span>
          </div>

          {brief.description && (
            <p className="font-body text-[14px] font-light text-silver leading-relaxed mb-5 whitespace-pre-wrap">
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

          {meta && (
            <p className="font-condensed text-[12px] tracking-[1.5px] text-grey mb-5">
              {meta}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/[0.05]">
            <Link
              href={`/studio/briefs/${id}/edit`}
              className="font-condensed text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 border border-white/15 text-silver hover:border-orange hover:text-orange transition-colors no-underline"
            >
              Edit
            </Link>
            {brief.status === "draft" && (
              <form action={async () => { "use server"; await setBriefStatus(id, "open"); }}>
                <button
                  type="submit"
                  className="font-condensed text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 bg-orange text-white hover:bg-orange-hot transition-colors"
                >
                  Open brief
                </button>
              </form>
            )}
            {brief.status === "open" && (
              <form action={async () => { "use server"; await setBriefStatus(id, "closed"); }}>
                <button
                  type="submit"
                  className="font-condensed text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 border border-white/15 text-silver hover:border-orange hover:text-orange transition-colors"
                >
                  Close brief
                </button>
              </form>
            )}
            <form action={async () => { "use server"; await deleteBrief(id); }}>
              <button
                type="submit"
                className="font-condensed text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 text-grey hover:text-orange transition-colors"
              >
                Delete
              </button>
            </form>
          </div>
        </div>

        {/* Invited */}
        <section className="bg-dark-3 p-7 mb-0.5 mt-0.5">
          <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange mb-4">
            Invited ({invitedTalents.length})
          </div>
          {invitedTalents.length === 0 ? (
            <p className="font-body text-[13px] font-light text-grey">
              No talent invited yet. Pick from the shortlist below.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-0.5">
              {invitedTalents.map((t) => {
                const imgs = Array.isArray(t.talent_images) ? t.talent_images : [];
                const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
                const url = primary ? signed[primary.storage_path] : null;
                const state = invitedMap.get(t.id)?.status ?? "pending";
                return (
                  <div key={t.id} className="bg-dark-2 flex flex-col">
                    <Link
                      href={`/studio/talent/${t.id}`}
                      className="block relative aspect-[3/4] bg-dark overflow-hidden no-underline"
                    >
                      {url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={t.stage_name} className="w-full h-full object-cover" />
                      )}
                      <span
                        className={`absolute top-2 left-2 font-condensed text-[9px] font-bold uppercase tracking-[1.5px] px-2 py-0.5 ${
                          state === "accepted"
                            ? "bg-green-500/80 text-white"
                            : state === "declined"
                            ? "bg-grey/80 text-white"
                            : "bg-orange/80 text-white"
                        }`}
                      >
                        {state}
                      </span>
                    </Link>
                    <div className="p-2.5 flex flex-col gap-1">
                      <div className="font-condensed text-[12px] font-semibold tracking-[0.5px] text-warm-white truncate">
                        {t.stage_name}
                      </div>
                      <form action={async () => { "use server"; await uninviteTalent(id, t.id); }}>
                        <button
                          type="submit"
                          className="font-condensed text-[10px] font-bold uppercase tracking-[1.5px] text-grey hover:text-orange transition-colors"
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Shortlist */}
        <section className="bg-dark-3 p-7 mt-0.5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange">
              Shortlist ({notInvitedMatches.length})
            </div>
            <span className="font-condensed text-[10px] tracking-[1.5px] text-grey">
              Filter match
            </span>
          </div>

          {notInvitedMatches.length === 0 ? (
            <p className="font-body text-[13px] font-light text-grey">
              No matches. Try widening your targets.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-0.5">
              {notInvitedMatches.map((m) => {
                const url = m.primary_storage_path ? signed[m.primary_storage_path] : null;
                return (
                  <div key={m.id} className="bg-dark-2 flex flex-col">
                    <Link
                      href={`/studio/talent/${m.id}`}
                      className="block relative aspect-[3/4] bg-dark overflow-hidden no-underline"
                    >
                      {url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={m.stage_name} className="w-full h-full object-cover" />
                      )}
                      {m.verified && (
                        <span className="absolute top-2 right-2 font-condensed text-[9px] font-bold uppercase tracking-[1.5px] px-1.5 py-0.5 bg-orange text-white">
                          ✓ Verified
                        </span>
                      )}
                    </Link>
                    <div className="p-2.5 flex flex-col gap-1">
                      <div className="font-condensed text-[12px] font-semibold tracking-[0.5px] text-warm-white truncate">
                        {m.stage_name}
                      </div>
                      <div className="font-condensed text-[10px] tracking-[1px] text-grey truncate">
                        {[m.gender, m.age_range, m.location].filter(Boolean).join(" · ")}
                      </div>
                      <form action={async () => { "use server"; await inviteTalent(id, m.id); }}>
                        <button
                          type="submit"
                          className="mt-1 w-full font-condensed text-[10px] font-bold uppercase tracking-[1.5px] px-2 py-1.5 bg-orange text-white hover:bg-orange-hot transition-colors"
                        >
                          Invite
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
