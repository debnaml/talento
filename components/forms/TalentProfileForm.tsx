"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Constants } from "@/types/database";

const CATEGORIES = Constants.public.Enums.talent_category;
const CATEGORY_LABELS: Record<string, string> = {
  film: "Film",
  tv: "TV",
  advertising: "Advertising",
  gaming: "Gaming",
  d2c: "D2C",
  sports: "Sports",
  music: "Music",
  historical: "Historical",
  stunt: "Stunt",
  action: "Action",
  drama: "Drama",
  comedy: "Comedy",
};

const COUNTRIES = [
  ["GB", "United Kingdom"],
  ["US", "United States"],
  ["AU", "Australia"],
  ["CA", "Canada"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["IT", "Italy"],
  ["ES", "Spain"],
  ["NL", "Netherlands"],
  ["SE", "Sweden"],
  ["NO", "Norway"],
  ["DK", "Denmark"],
  ["PL", "Poland"],
  ["BR", "Brazil"],
  ["MX", "Mexico"],
  ["JP", "Japan"],
  ["KR", "South Korea"],
  ["IN", "India"],
  ["SG", "Singapore"],
  ["ZA", "South Africa"],
];

const schema = z.object({
  stage_name: z.string().min(2, "Stage name must be at least 2 characters"),
  username: z
    .string()
    .regex(
      /^[a-z0-9][a-z0-9_-]{2,31}$/,
      "3–32 chars, lowercase letters, numbers, hyphen or underscore, must start with a letter or number",
    )
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  age_range: z.string().optional(),
  gender: z.string().optional(),
  height_cm: z.string().optional(),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  allows_film: z.boolean(),
  allows_advertising: z.boolean(),
  allows_gaming: z.boolean(),
  allows_d2c: z.boolean(),
  allows_political: z.boolean(),
  allows_adult: z.boolean(),
  featured_on_homepage: z.boolean(),
  agreement: z.literal(true, { error: "You must confirm this agreement" }),
});

type FormValues = z.infer<typeof schema>;

export type TalentProfileInitial = Partial<Omit<FormValues, "agreement">>;

type Props = {
  mode: "onboarding" | "settings";
  initial?: TalentProfileInitial;
};

export function TalentProfileForm({ mode, initial }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bioLength, setBioLength] = useState(initial?.bio?.length ?? 0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      stage_name: initial?.stage_name ?? "",
      username: initial?.username ?? "",
      bio: initial?.bio ?? "",
      location: initial?.location ?? "",
      country: initial?.country ?? "",
      age_range: initial?.age_range ?? "",
      gender: initial?.gender ?? "",
      height_cm: initial?.height_cm ?? "",
      categories: initial?.categories ?? [],
      allows_film: initial?.allows_film ?? true,
      allows_advertising: initial?.allows_advertising ?? true,
      allows_gaming: initial?.allows_gaming ?? true,
      allows_d2c: initial?.allows_d2c ?? false,
      allows_political: initial?.allows_political ?? false,
      allows_adult: initial?.allows_adult ?? false,
      featured_on_homepage: initial?.featured_on_homepage ?? false,
      // In settings mode the user already agreed during onboarding; pre-tick.
      agreement: mode === "settings" ? (true as const) : undefined,
    },
  });

  const selectedCategories = watch("categories") ?? [];

  function toggleCategory(cat: string) {
    const current = selectedCategories;
    if (current.includes(cat)) {
      setValue("categories", current.filter((c) => c !== cat), {
        shouldValidate: true,
      });
    } else {
      setValue("categories", [...current, cat], { shouldValidate: true });
    }
  }

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setServerError(null);
    setSavedFlash(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setServerError("Not signed in.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("talent_profiles")
      .upsert({
        id: user.id,
        stage_name: values.stage_name,
        ...(values.username
          ? { username: values.username.toLowerCase() }
          : {}),
        bio: values.bio ?? null,
        location: values.location ?? null,
        country: values.country ?? null,
        age_range: values.age_range ?? null,
        gender:
          (values.gender as
            | "male"
            | "female"
            | "non_binary"
            | "other"
            | "prefer_not") || null,
        height_cm: values.height_cm ? Number(values.height_cm) : null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        categories: values.categories as any[],
        allows_film: values.allows_film,
        allows_advertising: values.allows_advertising,
        allows_gaming: values.allows_gaming,
        allows_d2c: values.allows_d2c,
        allows_political: values.allows_political,
        allows_adult: values.allows_adult,
        featured_on_homepage: values.featured_on_homepage,
      });

    if (profileError) {
      setServerError(profileError.message);
      setLoading(false);
      return;
    }

    if (mode === "onboarding") {
      await supabase
        .from("profiles")
        .update({ onboarded: true })
        .eq("id", user.id);
      router.push("/talent/upload");
    } else {
      setSavedFlash(true);
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="bg-dark-3 border-t-2 border-orange p-8 mb-0.5">
        <h2 className="font-display text-[22px] tracking-[1px] text-warm-white mb-6 leading-none">
          BASICS
        </h2>

        {/* Stage name */}
        <div className="mb-5">
          <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
            Stage Name <span className="text-orange">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Alex M."
            className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
            {...register("stage_name")}
          />
          {errors.stage_name && (
            <p className="font-condensed text-[11px] text-orange mt-1.5">
              {errors.stage_name.message}
            </p>
          )}
        </div>

        {/* Username / public URL */}
        {mode === "settings" && (
          <div className="mb-5">
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Public URL{" "}
              <span className="text-grey normal-case tracking-normal">
                (talento.com/t/…)
              </span>
            </label>
            <div className="flex items-stretch">
              <span className="inline-flex items-center px-3 bg-dark-2 border border-r-0 border-white/10 font-body text-sm text-grey">
                /t/
              </span>
              <input
                type="text"
                placeholder="alex-m"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="flex-1 bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
                {...register("username")}
              />
            </div>
            {errors.username && (
              <p className="font-condensed text-[11px] text-orange mt-1.5">
                {errors.username.message}
              </p>
            )}
          </div>
        )}

        {/* Bio */}
        <div className="mb-5">
          <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
            Bio{" "}
            <span className="text-grey normal-case tracking-normal">
              ({bioLength}/500)
            </span>
          </label>
          <textarea
            rows={4}
            placeholder="A short description of yourself and your background…"
            className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors resize-none"
            {...register("bio", {
              onChange: (e) => setBioLength(e.target.value.length),
            })}
          />
          {errors.bio && (
            <p className="font-condensed text-[11px] text-orange mt-1.5">
              {errors.bio.message}
            </p>
          )}
        </div>

        {/* Location + Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Location
            </label>
            <input
              type="text"
              placeholder="London, UK"
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
              {...register("location")}
            />
          </div>
          <div>
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Country
            </label>
            <select
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
              {...register("country")}
            >
              <option value="">Select…</option>
              {COUNTRIES.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Age range + Gender + Height */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-0">
          <div>
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Age Range
            </label>
            <select
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
              {...register("age_range")}
            >
              <option value="">Select…</option>
              {["18-24", "25-34", "35-44", "45-54", "55-64", "65+"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Gender
            </label>
            <select
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
              {...register("gender")}
            >
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
              <option value="other">Other</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              placeholder="175"
              min={100}
              max={250}
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
              {...register("height_cm")}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-dark-3 p-8 mb-0.5">
        <h2 className="font-display text-[22px] tracking-[1px] text-warm-white mb-2 leading-none">
          CATEGORIES
        </h2>
        <p className="font-body text-[13px] font-light text-grey mb-5">
          Select everything that applies to you.
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const selected = selectedCategories.includes(cat);
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
        {errors.categories && (
          <p className="font-condensed text-[11px] text-orange mt-3">
            {errors.categories.message}
          </p>
        )}
      </div>

      {/* Consent toggles */}
      <div className="bg-dark-3 p-8 mb-0.5">
        <h2 className="font-display text-[22px] tracking-[1px] text-warm-white mb-2 leading-none">
          CONSENT
        </h2>
        <p className="font-body text-[13px] font-light text-grey mb-6">
          Set what you allow. You can change these any time. Default OFF means it
          won&apos;t happen without your explicit future consent.{" "}
          <a
            href="/consent"
            target="_blank"
            rel="noreferrer"
            className="text-orange hover:text-orange-hot"
          >
            What do these mean?
          </a>
        </p>

        <div className="flex flex-col gap-0">
          {(
            [
              ["allows_film", "Film & TV", true],
              ["allows_advertising", "Advertising", true],
              ["allows_gaming", "Gaming", true],
              ["allows_d2c", "D2C / E-commerce", false],
              ["allows_political", "Political Content", false],
              ["allows_adult", "Adult Content", false],
            ] as [keyof FormValues, string, boolean][]
          ).map(([field, label, defaultOn]) => (
            <label
              key={field}
              className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.05] last:border-0 cursor-pointer hover:bg-mid/30 transition-colors"
            >
              <div>
                <span className="font-condensed text-[13px] font-semibold uppercase tracking-[1.5px] text-warm-white">
                  {label}
                </span>
                {!defaultOn && (
                  <span className="ml-2 font-condensed text-[9px] font-bold uppercase tracking-[1px] text-grey border border-grey/30 px-1.5 py-0.5">
                    Default Off
                  </span>
                )}
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 accent-orange"
                {...register(field)}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Marketing visibility — separate opt-in from registry / AI consent */}
      <div className="bg-dark-3 p-8 mb-0.5">
        <h2 className="font-display text-[22px] tracking-[1px] text-warm-white mb-2 leading-none">
          MARKETING
        </h2>
        <p className="font-body text-[13px] font-light text-grey mb-6">
          Optional. Independent of your registry visibility and licensing
          consents above.
        </p>

        <label className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-mid/30 transition-colors">
          <div className="pr-4">
            <span className="font-condensed text-[13px] font-semibold uppercase tracking-[1.5px] text-warm-white block">
              Feature on Homepage
            </span>
            <span className="font-body text-[12px] font-light text-grey block mt-1">
              Allow your primary photo, stage name and categories to appear in the
              public &ldquo;Browse Talent&rdquo; preview on the marketing homepage.
              You can turn this off any time.
            </span>
          </div>
          <input
            type="checkbox"
            className="w-4 h-4 accent-orange flex-shrink-0"
            {...register("featured_on_homepage")}
          />
        </label>
      </div>

      {/* Agreement — hide in settings mode (already consented at signup) */}
      {mode === "onboarding" && (
        <div className="bg-dark-3 p-8 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 accent-orange flex-shrink-0"
              {...register("agreement")}
            />
            <span className="font-body text-[13px] font-light text-silver leading-snug">
              I confirm I am the person whose likeness will be licensed and I
              consent to the use cases I have enabled above. I understand I can
              update these permissions at any time from my dashboard.
            </span>
          </label>
          {errors.agreement && (
            <p className="font-condensed text-[11px] text-orange mt-2">
              {errors.agreement.message}
            </p>
          )}
        </div>
      )}

      {mode === "settings" && <div className="mb-6" />}

      {serverError && (
        <div className="bg-orange/10 border border-orange/30 px-4 py-3 mb-5">
          <p className="font-condensed text-[12px] text-orange">{serverError}</p>
        </div>
      )}

      {savedFlash && (
        <div className="bg-success/10 border border-success/30 px-4 py-3 mb-5">
          <p className="font-condensed text-[12px] text-success">
            Profile updated.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full font-condensed text-[14px] font-bold uppercase tracking-[2.5px] text-warm-white bg-orange hover:bg-orange-hot disabled:opacity-50 disabled:cursor-not-allowed px-9 py-4 transition-colors"
      >
        {loading
          ? "Saving…"
          : mode === "onboarding"
          ? "Save Profile & Continue →"
          : "Save Changes"}
      </button>
    </form>
  );
}
