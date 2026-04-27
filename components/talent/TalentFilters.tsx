"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

const CATEGORIES = [
  ["film", "Film"],
  ["tv", "TV"],
  ["advertising", "Advertising"],
  ["gaming", "Gaming"],
  ["d2c", "D2C"],
  ["sports", "Sports"],
  ["music", "Music"],
  ["stunt", "Stunt"],
];

const GENDERS = [
  ["male", "Male"],
  ["female", "Female"],
  ["non_binary", "Non-binary"],
];

const COUNTRIES = [
  ["GB", "UK"],
  ["US", "USA"],
  ["AU", "Australia"],
  ["CA", "Canada"],
  ["DE", "Germany"],
  ["FR", "France"],
];

export function TalentFilters({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const gender = searchParams.get("gender") ?? "";
  const country = searchParams.get("country") ?? "";

  const push = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v) params.set(k, v);
        else params.delete(k);
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  function toggleCategory(cat: string) {
    push({ category: category === cat ? "" : cat });
  }

  return (
    <div className="bg-dark-3 border border-white/[0.05] mb-8">
      {/* Search row */}
      <div className="flex items-stretch border-b border-white/[0.05]">
        <input
          type="text"
          defaultValue={q}
          placeholder="Search by name, location…"
          className="flex-1 bg-transparent px-7 py-5 text-warm-white font-body text-[15px] font-light placeholder:text-grey focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              push({ q: (e.target as HTMLInputElement).value });
            }
          }}
          onBlur={(e) => push({ q: e.target.value })}
        />
        <div className="w-px bg-white/[0.05]" />
        <div className="px-10 flex items-center font-condensed text-[11px] font-bold uppercase tracking-[2px] text-silver">
          <strong className="font-display text-[16px] text-orange mr-2">
            {resultCount}
          </strong>
          results
        </div>
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-0 px-5 py-3 border-b border-white/[0.04] flex-wrap">
        <span className="font-condensed text-[9px] font-bold uppercase tracking-[3px] text-grey min-w-[80px] px-2">
          Category
        </span>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map(([val, label]) => (
            <button
              key={val}
              onClick={() => toggleCategory(val)}
              className={`font-condensed text-[11px] font-semibold uppercase tracking-[1.5px] px-3 py-1.5 border transition-colors ${
                category === val
                  ? "bg-orange border-orange text-white"
                  : "border-white/[0.08] text-silver hover:border-orange/40 hover:text-orange"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Gender + Country */}
      <div className="flex items-center gap-0 px-5 py-3 flex-wrap">
        <span className="font-condensed text-[9px] font-bold uppercase tracking-[3px] text-grey min-w-[80px] px-2">
          Filter
        </span>
        <div className="flex flex-wrap gap-1 mr-4">
          {GENDERS.map(([val, label]) => (
            <button
              key={val}
              onClick={() => push({ gender: gender === val ? "" : val })}
              className={`font-condensed text-[11px] font-semibold uppercase tracking-[1.5px] px-3 py-1.5 border transition-colors ${
                gender === val
                  ? "bg-orange border-orange text-white"
                  : "border-white/[0.08] text-silver hover:border-orange/40 hover:text-orange"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {COUNTRIES.map(([val, label]) => (
            <button
              key={val}
              onClick={() => push({ country: country === val ? "" : val })}
              className={`font-condensed text-[11px] font-semibold uppercase tracking-[1.5px] px-3 py-1.5 border transition-colors ${
                country === val
                  ? "bg-orange border-orange text-white"
                  : "border-white/[0.08] text-silver hover:border-orange/40 hover:text-orange"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
