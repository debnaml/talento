import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type InboxRole = "studio" | "talent";

function relativeTime(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export async function ConversationInbox({ role }: { role: InboxRole }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: convos, error: convosErr } = await supabase
    .from("conversations")
    .select("id, studio_id, talent_id, brief_id, last_message_at, created_at")
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (convosErr) console.error("[ConversationInbox] convos fetch error", convosErr);

  // Preload related profiles + briefs in parallel
  const studioIds = Array.from(new Set((convos ?? []).map((c) => c.studio_id)));
  const talentIds = Array.from(new Set((convos ?? []).map((c) => c.talent_id)));
  const briefIds = Array.from(
    new Set((convos ?? []).map((c) => c.brief_id).filter((id): id is string => !!id)),
  );

  const [studiosRes, talentsRes, briefsRes] = await Promise.all([
    studioIds.length
      ? supabase.from("studio_profiles").select("id, company_name").in("id", studioIds)
      : Promise.resolve({ data: [] as { id: string; company_name: string }[] }),
    talentIds.length
      ? supabase.from("talent_profiles").select("id, stage_name").in("id", talentIds)
      : Promise.resolve({ data: [] as { id: string; stage_name: string }[] }),
    briefIds.length
      ? supabase.from("casting_briefs").select("id, title").in("id", briefIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  const studioMap = new Map((studiosRes.data ?? []).map((s) => [s.id, s.company_name]));
  const talentMap = new Map((talentsRes.data ?? []).map((t) => [t.id, t.stage_name]));
  const briefMap = new Map((briefsRes.data ?? []).map((b) => [b.id, b.title]));

  // Preload last message + unread counts for each convo
  const convoIds = (convos ?? []).map((c) => c.id);
  const { data: lastMessages } = convoIds.length
    ? await supabase
        .from("messages")
        .select("conversation_id, sender_id, body, created_at, read_at")
        .in("conversation_id", convoIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const latestByConvo = new Map<string, { body: string; mine: boolean }>();
  const unreadByConvo = new Map<string, number>();
  for (const m of lastMessages ?? []) {
    if (!latestByConvo.has(m.conversation_id)) {
      latestByConvo.set(m.conversation_id, {
        body: m.body,
        mine: m.sender_id === user.id,
      });
    }
    if (!m.read_at && m.sender_id !== user.id) {
      unreadByConvo.set(m.conversation_id, (unreadByConvo.get(m.conversation_id) ?? 0) + 1);
    }
  }

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
            MESSAGES
          </h1>
        </div>

        {!convos || convos.length === 0 ? (
          <div className="bg-dark-3 p-10 text-center">
            <p className="font-body text-[14px] font-light text-silver">
              No conversations yet.
            </p>
            <p className="font-body text-[13px] font-light text-grey mt-2">
              {role === "studio"
                ? "Message a talent from their profile or accept-response on a brief invite."
                : "Conversations appear when a studio messages you or you accept a brief invite."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {convos.map((c) => {
              const other =
                role === "studio"
                  ? talentMap.get(c.talent_id) ?? "Talent"
                  : studioMap.get(c.studio_id) ?? "Studio";
              const briefTitle = c.brief_id ? briefMap.get(c.brief_id) ?? null : null;
              const latest = latestByConvo.get(c.id);
              const unread = unreadByConvo.get(c.id) ?? 0;
              return (
                <Link
                  key={c.id}
                  href={`/${role}/messages/${c.id}`}
                  className="bg-dark-3 hover:bg-dark-2 transition-colors p-5 flex items-start justify-between gap-4 no-underline"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-display text-[18px] tracking-[1px] text-warm-white leading-none">
                        {other.toUpperCase()}
                      </div>
                      {unread > 0 && (
                        <span className="font-condensed text-[10px] font-bold uppercase tracking-[1.5px] px-1.5 py-0.5 bg-orange text-white">
                          {unread} new
                        </span>
                      )}
                    </div>
                    {briefTitle && (
                      <div className="font-condensed text-[10px] tracking-[1.5px] text-grey uppercase mb-1">
                        Re: {briefTitle}
                      </div>
                    )}
                    {latest ? (
                      <p className="font-body text-[13px] font-light text-silver line-clamp-1">
                        {latest.mine ? "You: " : ""}
                        {latest.body}
                      </p>
                    ) : (
                      <p className="font-body text-[12px] font-light text-grey italic">
                        No messages yet
                      </p>
                    )}
                  </div>
                  <span className="font-condensed text-[10px] tracking-[1.5px] text-grey shrink-0 whitespace-nowrap pt-1">
                    {relativeTime(c.last_message_at ?? c.created_at)}
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
