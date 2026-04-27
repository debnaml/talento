import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Tab = "all" | "draft" | "open" | "closed";

const STATUS_COLORS: Record<string, string> = {
  draft: "text-grey border-grey/30",
  open: "text-green-400 border-green-500/30",
  closed: "text-silver border-white/10",
  cancelled: "text-grey border-white/10",
};

export default async function StudioBriefsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: Tab }>;
}) {
  const { tab = "all" } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("casting_briefs")
    .select("id, title, status, created_at, categories, gender, country")
    .eq("studio_id", user.id)
    .order("created_at", { ascending: false });

  if (tab !== "all") query = query.eq("status", tab);

  const { data: briefs } = await query;

  const tabs: [Tab, string][] = [
    ["all", "All"],
    ["draft", "Draft"],
    ["open", "Open"],
    ["closed", "Closed"],
  ];

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[900px] mx-auto">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2.5 mb-3">
              <div className="w-6 h-0.5 bg-orange" />
              <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
                Casting Briefs
              </span>
            </div>
            <h1 className="font-display text-[clamp(32px,4vw,52px)] tracking-[2px] text-warm-white leading-none">
              YOUR BRIEFS
            </h1>
          </div>
          <Link
            href="/studio/briefs/new"
            className="font-condensed text-[13px] font-bold uppercase tracking-[2px] px-6 py-3 bg-orange text-white hover:bg-orange-hot transition-colors no-underline"
          >
            + New Brief
          </Link>
        </div>

        <div className="flex items-center gap-0.5 mb-0.5">
          {tabs.map(([key, label]) => {
            const active = tab === key;
            return (
              <Link
                key={key}
                href={`/studio/briefs${key === "all" ? "" : `?tab=${key}`}`}
                className={`font-condensed text-[11px] font-bold uppercase tracking-[2px] px-4 py-3 transition-colors no-underline ${
                  active
                    ? "bg-dark-3 text-orange border-b-2 border-orange"
                    : "bg-dark-2 text-grey hover:text-silver border-b-2 border-transparent"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {!briefs || briefs.length === 0 ? (
          <div className="bg-dark-3 p-10 text-center">
            <p className="font-body text-[14px] font-light text-silver mb-4">
              No briefs yet.
            </p>
            <Link
              href="/studio/briefs/new"
              className="inline-flex font-condensed text-[12px] font-bold uppercase tracking-[2px] text-orange hover:text-orange-hot transition-colors no-underline"
            >
              Create your first brief →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {briefs.map((b) => {
              const meta = [
                b.categories && b.categories.length
                  ? `${b.categories.length} categor${b.categories.length === 1 ? "y" : "ies"}`
                  : null,
                b.gender,
                b.country,
              ].filter(Boolean).join(" · ");
              return (
                <Link
                  key={b.id}
                  href={`/studio/briefs/${b.id}`}
                  className="bg-dark-3 hover:bg-dark-2 transition-colors p-6 flex items-start justify-between gap-4 no-underline"
                >
                  <div className="min-w-0">
                    <div className="font-display text-[20px] tracking-[1px] text-warm-white leading-none mb-2">
                      {b.title.toUpperCase()}
                    </div>
                    {meta && (
                      <div className="font-condensed text-[12px] tracking-[1px] text-grey">
                        {meta}
                      </div>
                    )}
                  </div>
                  <span
                    className={`font-condensed text-[10px] font-bold uppercase tracking-[2px] px-2.5 py-1 border ${STATUS_COLORS[b.status] ?? "text-grey border-white/10"} shrink-0`}
                  >
                    {b.status}
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
