"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  /** Postgres realtime channel name — must be unique per subscription target. */
  channel: string;
  /** Table to subscribe to. */
  table: "messages" | "notifications" | "conversations";
  /** Optional filter, e.g. "conversation_id=eq.uuid" or "user_id=eq.uuid". */
  filter?: string;
  /** Event type, defaults to INSERT. */
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
};

/**
 * Client-only helper that subscribes to a Supabase Realtime channel and calls
 * router.refresh() whenever a matching event arrives. Debounced to avoid
 * thrashing when multiple events land in rapid succession.
 */
export function RealtimeRefresh({ channel, table, filter, event = "INSERT" }: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const bump = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        router.refresh();
      }, 120);
    };

    const sub = supabase
      .channel(channel)
      .on(
        "postgres_changes",
        { event, schema: "public", table, filter },
        bump,
      )
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(sub);
    };
  }, [channel, table, filter, event, router]);

  return null;
}
