"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "film", "tv", "advertising", "gaming", "d2c", "sports", "music",
  "historical", "stunt", "action", "drama", "comedy",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  film: "Film", tv: "TV", advertising: "Advertising", gaming: "Gaming",
  d2c: "D2C", sports: "Sports", music: "Music", historical: "Historical",
  stunt: "Stunt", action: "Action", drama: "Drama", comedy: "Comedy",
};

export type BriefFormInitial = {
  id?: string;
  title?: string;
  description?: string | null;
  categories?: string[] | null;
  gender?: string | null;
  age_range?: string | null;
  country?: string | null;
  height_min_cm?: number | null;
  height_max_cm?: number | null;
  requires_video?: boolean | null;
  requires_voice?: boolean | null;
  requires_verified?: boolean | null;
  budget_gbp_min?: number | null;
  budget_gbp_max?: number | null;
  usage_scope?: string | null;
  shoot_date?: string | null;
  status?: "draft" | "open" | "closed" | "cancelled" | null;
};

type Props = {
  mode: "new" | "edit";
  initial?: BriefFormInitial;
  action: (fd: FormData) => Promise<{ error?: string; ok?: boolean } | void>;
};

export function BriefForm({ mode, initial, action }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>(initial?.categories ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSavedFlash(false);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    // sync categories state into FD
    fd.delete("categories");
    categories.forEach((c) => fd.append("categories", c));

    const result = await action(fd);
    setLoading(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }
    if (mode === "edit") {
      setSavedFlash(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Basics */}
      <div className="bg-dark-3 border-t-2 border-orange p-8 mb-0.5">
        <h2 className="font-display text-[22px] tracking-[1px] text-warm-white mb-6 leading-none">
          BRIEF
        </h2>

        <div className="mb-5">
          <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
            Title <span className="text-orange">*</span>
          </label>
          <input
            name="title"
            type="text"
            required
            defaultValue={initial?.title ?? ""}
            placeholder="e.g. Female lead, late 20s, UK accent"
            className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-5">
          <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            defaultValue={initial?.description ?? ""}
            placeholder="Scene, tone, character, delivery notes…"
            className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors resize-none"
          />
        </div>
      </div>

      {/* Target */}
      <div className="bg-dark-3 p-8 mb-0.5">
        <h2 className="font-display text-[22px] tracking-[1px] text-warm-white mb-2 leading-none">
          TARGET
        </h2>
        <p className="font-body text-[13px] font-light text-grey mb-5">
          Leave blank for any. All filters are AND.
        </p>

        <div className="mb-5">
          <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const selected = categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`font-condensed text-[12px] font-bold uppercase tracking-[2px] px-4 py-2 border transition-colors ${
                    selected
                      ? "bg-orange border-orange text-warm-white"
                      : "bg-transparent border-white/15 text-silver hover:border-orange hover:text-orange"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div>
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Gender
            </label>
            <select
              name="gender"
              defaultValue={initial?.gender ?? ""}
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
            >
              <option value="">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
              <option value="other">Other</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Age Range
            </label>
            <select
              name="age_range"
              defaultValue={initial?.age_range ?? ""}
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
            >
              <option value="">Any</option>
              {["18-24", "25-34", "35-44", "45-54", "55-64", "65+"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Country
            </label>
            <input
              name="country"
              type="text"
              maxLength={2}
              defaultValue={initial?.country ?? ""}
              placeholder="GB"
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Height min (cm)
            </label>
            <input
              name="height_min_cm"
              type="number"
              min={100} max={250}
              defaultValue={initial?.height_min_cm ?? ""}
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Height max (cm)
            </label>
            <input
              name="height_max_cm"
              type="number"
              min={100} max={250}
              defaultValue={initial?.height_max_cm ?? ""}
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-0">
          {([
            ["requires_video", "Must have showreel video", initial?.requires_video],
            ["requires_voice", "Must have voice sample", initial?.requires_voice],
            ["requires_verified", "Verified talent only", initial?.requires_verified],
          ] as const).map(([field, label, on]) => (
            <label
              key={field}
              className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] last:border-0 cursor-pointer hover:bg-dark-2/30 transition-colors"
            >
              <span className="font-condensed text-[13px] font-semibold uppercase tracking-[1.5px] text-warm-white">
                {label}
              </span>
              <input
                type="checkbox"
                name={field}
                defaultChecked={!!on}
                className="w-4 h-4 accent-orange"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Commercial */}
      <div className="bg-dark-3 p-8 mb-0.5">
        <h2 className="font-display text-[22px] tracking-[1px] text-warm-white mb-5 leading-none">
          COMMERCIAL
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Budget min (£)
            </label>
            <input
              name="budget_gbp_min"
              type="number"
              min={0}
              defaultValue={initial?.budget_gbp_min ?? ""}
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Budget max (£)
            </label>
            <input
              name="budget_gbp_max"
              type="number"
              min={0}
              defaultValue={initial?.budget_gbp_max ?? ""}
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
            Usage scope
          </label>
          <input
            name="usage_scope"
            type="text"
            defaultValue={initial?.usage_scope ?? ""}
            placeholder="e.g. UK broadcast + digital, 12 months"
            className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-0">
          <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
            Shoot date
          </label>
          <input
            name="shoot_date"
            type="date"
            defaultValue={initial?.shoot_date ?? ""}
            className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Status */}
      <div className="bg-dark-3 p-8 mb-6">
        <h2 className="font-display text-[22px] tracking-[1px] text-warm-white mb-5 leading-none">
          STATUS
        </h2>
        <select
          name="status"
          defaultValue={initial?.status ?? "draft"}
          className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
        >
          <option value="draft">Draft — not visible to anyone</option>
          <option value="open">Open — invited talents can see it</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="bg-orange/10 border border-orange/30 px-4 py-3 mb-5">
          <p className="font-condensed text-[12px] text-orange">{error}</p>
        </div>
      )}

      {savedFlash && (
        <div className="bg-success/10 border border-success/30 px-4 py-3 mb-5">
          <p className="font-condensed text-[12px] text-success">Brief updated.</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="font-condensed text-[14px] font-bold uppercase tracking-[2.5px] text-warm-white bg-orange hover:bg-orange-hot disabled:opacity-50 disabled:cursor-not-allowed px-9 py-4 transition-colors"
        >
          {loading ? "Saving…" : mode === "new" ? "Create Brief" : "Save Changes"}
        </button>
        <Link
          href={mode === "edit" && initial?.id ? `/studio/briefs/${initial.id}` : "/studio/briefs"}
          className="font-condensed text-[12px] font-bold uppercase tracking-[2px] text-grey hover:text-orange transition-colors no-underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
