"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Constants } from "@/types/database";

const STUDIO_TYPES = Constants.public.Enums.studio_type;
const STUDIO_TYPE_LABELS: Record<string, string> = {
  film_production: "Film Production",
  advertising_agency: "Advertising Agency",
  gaming_studio: "Gaming Studio",
  brand: "Brand / D2C",
  music_label: "Music Label",
  other: "Other",
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

const LOGO_MAX_BYTES = 5 * 1024 * 1024;
const LOGO_ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

const schema = z.object({
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
  studio_type: z.enum([
    "film_production",
    "advertising_agency",
    "gaming_studio",
    "brand",
    "music_label",
    "other",
  ]),
  website: z
    .string()
    .url("Must be a valid URL (include https://)")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(400, "Description must be 400 characters or less")
    .optional(),
  country: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export type StudioProfileInitial = Partial<FormValues> & {
  logo_url?: string | null;
  logo_signed_url?: string | null;
};

type Props = {
  mode: "onboarding" | "settings";
  initial?: StudioProfileInitial;
};

export function StudioProfileForm({ mode, initial }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [loading, setLoading] = useState(false);

  // Logo state — we manage this outside RHF since it's a file, not a field.
  const [logoPath, setLogoPath] = useState<string | null>(initial?.logo_url ?? null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initial?.logo_signed_url ?? null
  );
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: initial?.company_name ?? "",
      studio_type: initial?.studio_type ?? "advertising_agency",
      website: initial?.website ?? "",
      description: initial?.description ?? "",
      country: initial?.country ?? "",
    },
  });

  async function onLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setLogoError(null);

    if (!LOGO_ALLOWED.includes(file.type)) {
      setLogoError("Use JPG, PNG, WebP, or SVG.");
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      setLogoError("Logo must be 5MB or less.");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLogoError("Not signed in.");
      return;
    }

    setLogoUploading(true);

    const ext = file.name.split(".").pop() ?? "png";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("studio-logos")
      .upload(path, file, { contentType: file.type });

    if (uploadErr) {
      setLogoError(uploadErr.message);
      setLogoUploading(false);
      return;
    }

    // Remove the previous logo to keep storage clean (best-effort).
    if (logoPath && logoPath !== path) {
      await supabase.storage.from("studio-logos").remove([logoPath]);
    }

    const { data: signed } = await supabase.storage
      .from("studio-logos")
      .createSignedUrl(path, 3600);

    setLogoPath(path);
    setLogoPreview(signed?.signedUrl ?? null);
    setLogoUploading(false);
  }

  async function onLogoRemove() {
    if (!logoPath) return;
    const supabase = createClient();
    await supabase.storage.from("studio-logos").remove([logoPath]);
    setLogoPath(null);
    setLogoPreview(null);
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
      .from("studio_profiles")
      .upsert({
        id: user.id,
        company_name: values.company_name,
        studio_type: values.studio_type,
        website: values.website || null,
        description: values.description || null,
        country: values.country || null,
        logo_url: logoPath,
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
      router.push("/studio/browse");
    } else {
      setSavedFlash(true);
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="bg-dark-3 border-t-2 border-orange p-8 mb-0.5">
        {/* Logo uploader */}
        <div className="mb-6">
          <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
            Logo
          </label>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-20 h-20 bg-dark-2 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="font-condensed text-[10px] uppercase tracking-[1.5px] text-grey">
                  No logo
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <label className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-warm-white bg-orange hover:bg-orange-hot px-4 py-2 cursor-pointer transition-colors">
                {logoPath ? "Replace" : "Upload"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={onLogoSelect}
                  disabled={logoUploading}
                />
              </label>
              {logoPath && (
                <button
                  type="button"
                  onClick={onLogoRemove}
                  className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-orange border border-white/10 hover:border-orange px-4 py-2 transition-colors"
                >
                  Remove
                </button>
              )}
              {logoUploading && (
                <span className="font-condensed text-[11px] text-silver">
                  Uploading…
                </span>
              )}
            </div>
          </div>
          {logoError && (
            <p className="font-condensed text-[11px] text-orange mt-2">
              {logoError}
            </p>
          )}
          <p className="font-condensed text-[11px] text-grey mt-2">
            JPG, PNG, WebP, or SVG. Max 5MB.
          </p>
        </div>

        {/* Company name */}
        <div className="mb-5">
          <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
            Company Name <span className="text-orange">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Apex Films Ltd."
            className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
            {...register("company_name")}
          />
          {errors.company_name && (
            <p className="font-condensed text-[11px] text-orange mt-1.5">
              {errors.company_name.message}
            </p>
          )}
        </div>

        {/* Studio type */}
        <div className="mb-5">
          <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
            Studio Type <span className="text-orange">*</span>
          </label>
          <select
            className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
            {...register("studio_type")}
          >
            {STUDIO_TYPES.map((type) => (
              <option key={type} value={type}>
                {STUDIO_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          {errors.studio_type && (
            <p className="font-condensed text-[11px] text-orange mt-1.5">
              {errors.studio_type.message}
            </p>
          )}
        </div>

        {/* Website + Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Website
            </label>
            <input
              type="url"
              placeholder="https://studio.com"
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
              {...register("website")}
            />
            {errors.website && (
              <p className="font-condensed text-[11px] text-orange mt-1.5">
                {errors.website.message}
              </p>
            )}
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

        {/* Description */}
        <div className="mb-0">
          <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
            About Your Studio
          </label>
          <textarea
            rows={3}
            placeholder="What you produce and what kind of talent you typically look for…"
            className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors resize-none"
            {...register("description")}
          />
          {errors.description && (
            <p className="font-condensed text-[11px] text-orange mt-1.5">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      {serverError && (
        <div className="bg-orange/10 border border-orange/30 px-4 py-3 mb-5 mt-5">
          <p className="font-condensed text-[12px] text-orange">{serverError}</p>
        </div>
      )}

      {savedFlash && (
        <div className="bg-green-500/10 border border-green-500/30 px-4 py-3 mb-5 mt-5">
          <p className="font-condensed text-[12px] text-green-400">
            Studio profile updated.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full font-condensed text-[14px] font-bold uppercase tracking-[2.5px] text-warm-white bg-orange hover:bg-orange-hot disabled:opacity-50 disabled:cursor-not-allowed px-9 py-4 transition-colors mt-6"
      >
        {loading
          ? "Saving…"
          : mode === "onboarding"
          ? "Enter the Registry →"
          : "Save Changes"}
      </button>
    </form>
  );
}
