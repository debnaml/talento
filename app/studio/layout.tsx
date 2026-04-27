import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudioNav } from "@/components/nav/StudioNav";
import { RealtimeRefresh } from "@/components/realtime/RealtimeRefresh";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "studio") redirect("/");

  const { data: studio } = await supabase
    .from("studio_profiles")
    .select("company_name")
    .eq("id", user.id)
    .single();

  const [{ count: unreadNotifications }, { data: convos }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
    supabase
      .from("conversations")
      .select("id")
      .eq("studio_id", user.id),
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
    <>
      <StudioNav
        profile={{
          full_name: profile.full_name,
          email: profile.email ?? user.email ?? "",
          company_name: studio?.company_name ?? null,
        }}
        unreadMessages={unreadMessages}
        unreadNotifications={unreadNotifications ?? 0}
      />
      <RealtimeRefresh
        channel={`user-notifications:${user.id}`}
        table="notifications"
        filter={`user_id=eq.${user.id}`}
      />
      <main className="pt-[72px]">{children}</main>
    </>
  );
}
