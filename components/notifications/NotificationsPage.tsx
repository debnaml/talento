import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { markNotificationsRead } from "@/app/actions/notifications";

type Role = "studio" | "talent";

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

function notificationHref(kind: string, payload: Record<string, unknown>, role: Role): string {
  switch (kind) {
    case "invite_received":
      return `/talent/invites/${payload.brief_id as string}`;
    case "invite_accepted":
    case "invite_declined":
      return `/studio/briefs/${payload.brief_id as string}`;
    case "message_received":
      return `/${role}/messages/${payload.conversation_id as string}`;
    case "profile_saved":
      return "/talent/dashboard";
    default:
      return `/${role}/dashboard`;
  }
}

function notificationText(kind: string, payload: Record<string, unknown>): string {
  switch (kind) {
    case "invite_received":
      return `${payload.studio_name ?? "A studio"} invited you to "${payload.brief_title ?? "a brief"}".`;
    case "invite_accepted":
      return `${payload.talent_name ?? "Talent"} accepted your invite to "${payload.brief_title ?? "your brief"}".`;
    case "invite_declined":
      return `${payload.talent_name ?? "Talent"} declined your invite to "${payload.brief_title ?? "your brief"}".`;
    case "message_received":
      return `${payload.sender_name ?? "Someone"}: ${payload.preview ?? ""}`;
    case "profile_saved":
      return `${payload.studio_name ?? "A studio"} saved your profile.`;
    default:
      return kind;
  }
}

export async function NotificationsPage({ role }: { role: Role }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, kind, payload, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  // Mark all as read on view (skip revalidation — we're mid-render)
  await markNotificationsRead(undefined, { revalidate: false });

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[720px] mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-6 h-0.5 bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              Activity
            </span>
          </div>
          <h1 className="font-display text-[clamp(32px,4vw,52px)] tracking-[2px] text-warm-white leading-none">
            NOTIFICATIONS
          </h1>
        </div>

        {!notifications || notifications.length === 0 ? (
          <div className="bg-dark-3 p-10 text-center">
            <p className="font-body text-[14px] font-light text-silver">
              No notifications yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {notifications.map((n) => {
              const payload = (n.payload ?? {}) as Record<string, unknown>;
              const href = notificationHref(n.kind, payload, role);
              const text = notificationText(n.kind, payload);
              return (
                <Link
                  key={n.id}
                  href={href}
                  className={`p-4 hover:bg-dark-2 transition-colors flex items-start gap-3 no-underline ${
                    n.read_at ? "bg-dark-3" : "bg-dark-3 border-l-2 border-orange"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-[13px] font-light text-warm-white leading-snug">
                      {text}
                    </p>
                    <div className="font-condensed text-[10px] tracking-[1.5px] text-grey uppercase mt-1">
                      {relativeTime(n.created_at)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
