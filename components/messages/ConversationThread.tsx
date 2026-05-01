import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { RealtimeRefresh } from "@/components/realtime/RealtimeRefresh";
import { markConversationRead } from "@/app/actions/messaging";
import { blockUser } from "@/app/actions/blocks";

export type ConversationRole = "studio" | "talent";

function formatTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function ConversationThread({
  conversationId,
  role,
}: {
  conversationId: string;
  role: ConversationRole;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: convo, error: convoErr } = await supabase
    .from("conversations")
    .select("id, studio_id, talent_id, brief_id, created_at")
    .eq("id", conversationId)
    .maybeSingle();
  if (convoErr) console.error("[ConversationThread] convo fetch error", convoErr);
  if (!convo) notFound();

  const [{ data: studioRow }, { data: talentRow }, briefRes] = await Promise.all([
    supabase.from("studio_profiles").select("company_name").eq("id", convo.studio_id).maybeSingle(),
    supabase.from("talent_profiles").select("stage_name, username").eq("id", convo.talent_id).maybeSingle(),
    convo.brief_id
      ? supabase.from("casting_briefs").select("title").eq("id", convo.brief_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const otherId = role === "studio" ? convo.talent_id : convo.studio_id;
  const otherName =
    role === "studio"
      ? talentRow?.stage_name ?? "Talent"
      : studioRow?.company_name ?? "Studio";
  const briefTitle = (briefRes?.data as { title?: string } | null)?.title ?? null;

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, read_at, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  // Mark unread messages as read (best-effort)
  await markConversationRead(conversationId);

  const backHref = `/${role}/messages`;

  return (
    <div className="min-h-screen bg-dark px-4 py-10 md:py-16">
      <RealtimeRefresh
        channel={`thread:${conversationId}`}
        table="messages"
        filter={`conversation_id=eq.${conversationId}`}
      />
      <div className="max-w-[760px] mx-auto">
        <div className="mb-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-orange transition-colors no-underline"
          >
            ← Messages
          </Link>
        </div>

        {/* Header */}
        <div className="bg-dark-3 border-t-2 border-orange p-5 mb-0.5 flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange mb-1">
              {role === "studio" ? "Talent" : "Studio"}
            </div>
            <div className="font-display text-[24px] tracking-[1px] text-warm-white leading-none">
              {otherName.toUpperCase()}
            </div>
            {briefTitle && (
              <div className="font-condensed text-[11px] tracking-[1.5px] text-silver mt-1.5">
                Re: {briefTitle}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {role === "studio" && (
              <Link
                href={`/studio/talent/${convo.talent_id}`}
                className="font-condensed text-[11px] font-bold uppercase tracking-[2px] px-3 py-2 border border-white/15 text-silver hover:border-orange hover:text-orange transition-colors no-underline"
              >
                View profile
              </Link>
            )}
            <form
              action={async () => {
                "use server";
                await blockUser(otherId);
                redirect(backHref);
              }}
            >
              <button
                type="submit"
                className="font-condensed text-[11px] font-bold uppercase tracking-[2px] px-3 py-2 text-grey hover:text-orange transition-colors"
                title={`Block ${otherName}`}
              >
                Block
              </button>
            </form>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-dark-3 p-5 flex flex-col gap-3 min-h-[300px]">
          {!messages || messages.length === 0 ? (
            <p className="font-body text-[13px] font-light text-grey text-center py-8">
              No messages yet. Say hello.
            </p>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === user.id;
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 ${
                      mine
                        ? "bg-orange/90 text-white"
                        : "bg-dark-2 border border-white/10 text-warm-white"
                    }`}
                  >
                    <p className="font-body text-[14px] font-light leading-snug whitespace-pre-wrap break-words">
                      {m.body}
                    </p>
                    <div className="font-condensed text-[9px] tracking-[1.5px] uppercase mt-1 opacity-60">
                      {formatTime(m.created_at)}
                      {mine && m.read_at ? " · read" : ""}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <MessageComposer conversationId={conversationId} />
      </div>
    </div>
  );
}
