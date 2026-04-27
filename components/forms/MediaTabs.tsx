"use client";

import { useState, type ReactNode } from "react";

export type MediaTabKey = "photos" | "videos" | "voice";

export function MediaTabs({
  counts,
  photos,
  videos,
  voice,
}: {
  counts: { photos: number; videos: number; voice: number };
  photos: ReactNode;
  videos: ReactNode;
  voice: ReactNode;
}) {
  const [tab, setTab] = useState<MediaTabKey>("photos");

  const tabs: Array<{ key: MediaTabKey; label: string; count: number; cap: number }> = [
    { key: "photos", label: "Photos", count: counts.photos, cap: 12 },
    { key: "videos", label: "Videos", count: counts.videos, cap: 5 },
    { key: "voice", label: "Voice", count: counts.voice, cap: 3 },
  ];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Media type"
        className="flex gap-0 border-b border-white/[0.08] mb-8"
      >
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`relative flex-1 md:flex-none md:min-w-[140px] px-5 py-4 font-condensed text-[12px] font-bold uppercase tracking-[2px] transition-colors ${
                active
                  ? "text-warm-white"
                  : "text-grey hover:text-silver"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 text-[10px] ${active ? "text-orange" : "text-grey"}`}>
                {t.count}
              </span>
              {active && <div className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-orange" />}
            </button>
          );
        })}
      </div>

      <div hidden={tab !== "photos"}>{photos}</div>
      <div hidden={tab !== "videos"}>{videos}</div>
      <div hidden={tab !== "voice"}>{voice}</div>
    </div>
  );
}
