import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TalentNav } from "@/components/nav/TalentNav";
import { RealtimeRefresh } from "@/components/realtime/RealtimeRefresh";

export default async function TalentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, onboarded, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "talent") {
    redirect("/");
  }

  const [{ count: unreadNotifications }, { data: convos }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
    supabase
      .from("conversations")
      .select("id")
      .eq("talent_id", user.id),
  ]);

  let unreadMessages = 0;
  const convoIds = (convos ?? []).map((c) => c.id);
  if (convoIds.length) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", convoIds)
      .neq("sender_id", user.id)
      .is("read_at", null);
    unreadMessages = count ?? 0;
  }

  return (
    <div className="min-h-screen bg-dark">
      <TalentNav
        profile={{ full_name: profile.full_name, email: profile.email }}
        unreadMessages={unreadMessages}
        unreadNotifications={unreadNotifications ?? 0}
      />
      <RealtimeRefresh
        channel={`user-notifications:${user.id}`}
        table="notifications"
        filter={`user_id=eq.${user.id}`}
      />
      <main className="pt-[72px]">{children}</main>
    </div>
  );
}
