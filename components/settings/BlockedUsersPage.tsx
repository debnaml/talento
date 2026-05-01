import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { unblockUser } from "@/app/actions/blocks";

type Role = "studio" | "talent";

export async function BlockedUsersPage({ role }: { role: Role }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: blocks } = await supabase
    .from("user_blocks")
    .select("blocked_id, reason, created_at")
    .eq("blocker_id", user.id)
    .order("created_at", { ascending: false });

  const ids = (blocks ?? []).map((b) => b.blocked_id);

  // Fetch display names in parallel from both role tables
  const [{ data: studios }, { data: talents }] = ids.length
    ? await Promise.all([
        supabase.from("studio_profiles").select("id, company_name").in("id", ids),
        supabase.from("talent_profiles").select("id, stage_name, username").in("id", ids),
      ])
    : [{ data: [] }, { data: [] }];

  const names = new Map<string, { name: string; role: Role; username?: string | null }>();
  for (const s of studios ?? []) names.set(s.id, { name: s.company_name, role: "studio" });
  for (const t of talents ?? []) names.set(t.id, { name: t.stage_name, role: "talent", username: t.username });

  const backHref = `/${role}/dashboard`;

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[680px] mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-6 h-0.5 bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              Safety
            </span>
          </div>
          <h1 className="font-display text-[clamp(32px,4vw,52px)] tracking-[2px] text-warm-white leading-none">
            BLOCKED
          </h1>
          <p className="font-body text-[14px] font-light text-grey mt-3">
            Blocked accounts cannot see you, message you, invite you, or save your profile.
          </p>
        </div>

        {!blocks || blocks.length === 0 ? (
          <div className="bg-dark-3 p-10 text-center">
            <p className="font-body text-[14px] font-light text-silver">
              You haven&apos;t blocked anyone.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {blocks.map((b) => {
              const meta = names.get(b.blocked_id);
              return (
                <div
                  key={b.blocked_id}
                  className="bg-dark-3 p-5 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-display text-[18px] tracking-[1px] text-warm-white leading-none mb-1">
                      {(meta?.name ?? "Deleted account").toUpperCase()}
                    </div>
                    <div className="font-condensed text-[10px] tracking-[1.5px] text-grey uppercase">
                      {meta?.role ?? "unknown"} · blocked {b.created_at ? new Date(b.created_at).toLocaleDateString() : ""}
                    </div>
                    {b.reason && (
                      <p className="font-body text-[12px] font-light text-silver mt-1.5">
                        {b.reason}
                      </p>
                    )}
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await unblockUser(b.blocked_id);
                    }}
                  >
                    <button
                      type="submit"
                      className="font-condensed text-[11px] font-bold uppercase tracking-[2px] px-3 py-2 border border-white/15 text-silver hover:border-orange hover:text-orange transition-colors"
                    >
                      Unblock
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
