"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/app/actions/messaging";

export function MessageComposer({
  conversationId,
}: {
  conversationId: string;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = value.trim();
    if (!body) return;

    startTransition(async () => {
      setError(null);
      const result = await sendMessage(conversationId, body);
      if (result.error) {
        setError(result.error);
        return;
      }
      setValue("");
      router.refresh();
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-dark-3 p-4 border-t border-white/[0.05]">
      {error && (
        <div className="bg-orange/10 border border-orange/30 px-3 py-2 mb-2">
          <p className="font-condensed text-[11px] text-orange">{error}</p>
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          rows={2}
          maxLength={4000}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Write a message… (⌘+Enter to send)"
          className="flex-1 bg-dark-2 border border-white/10 px-3 py-2.5 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors resize-none"
        />
        <button
          type="submit"
          disabled={pending || !value.trim()}
          className="font-condensed text-[12px] font-bold uppercase tracking-[2px] text-warm-white bg-orange hover:bg-orange-hot disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 transition-colors shrink-0"
        >
          {pending ? "…" : "Send"}
        </button>
      </div>
    </form>
  );
}
