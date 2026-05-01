import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TalentCard } from "@/components/talent/TalentCard";

export default async function StudioDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: studio } = await supabase
    .from("studio_profiles")
    .select("company_name, studio_type")
    .eq("id", user.id)
    .single();

  if (!studio) redirect("/studio/onboarding");

  // Fetch saved talents with their profiles and primary image
  const { data: saves } = await supabase
    .from("talent_saves")
    .select(
      "talent_id, created_at, talent_profiles(id, stage_name, location, country, gender, age_range, categories, verified, talent_images(storage_path, is_primary))"
    )
    .eq("studio_id", user.id)
    .order("created_at", { ascending: false });

  // Generate signed URLs for primary images
  const savedTalents = await Promise.all(
    (saves ?? []).map(async (save) => {
      const tp = save.talent_profiles as {
        id: string;
        stage_name: string;
        location: string | null;
        country: string | null;
        gender: string | null;
        age_range: string | null;
        categories: string[] | null;
        verified: boolean | null;
        talent_images: { storage_path: string; is_primary: boolean | null }[];
      } | null;

      if (!tp) return null;

      const images = Array.isArray(tp.talent_images) ? tp.talent_images : [];
      const primary = images.find((i) => i.is_primary) ?? images[0];
      let imageUrl: string | null = null;
      if (primary) {
        const { data } = await supabase.storage
          .from("talent-images")
          .createSignedUrl(primary.storage_path, 3600);
        imageUrl = data?.signedUrl ?? null;
      }

      return { ...tp, imageUrl };
    })
  );

  const validTalents = savedTalents.filter(Boolean) as NonNullable<(typeof savedTalents)[0]>[];

  const STUDIO_TYPE_LABELS: Record<string, string> = {
    film_production: "Film Production",
    advertising_agency: "Advertising Agency",
    gaming_studio: "Gaming Studio",
    brand: "Brand / D2C",
    music_label: "Music Label",
    other: "Other",
  };

  return (
    <div className="min-h-screen bg-dark px-6 md:px-12 py-16">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2.5 mb-3">
              <div className="w-6 h-0.5 bg-orange" />
              <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
                Studio Dashboard
              </span>
            </div>
            <h1 className="font-display text-[clamp(32px,4vw,52px)] tracking-[2px] text-warm-white leading-none">
              {studio.company_name.toUpperCase()}
            </h1>
            <p className="font-condensed text-[12px] tracking-[1.5px] text-grey mt-1.5">
              {STUDIO_TYPE_LABELS[studio.studio_type] ?? studio.studio_type}
            </p>

          </div>
          <div className="flex flex-col items-end gap-2">
            <Link
              href="/studio/browse"
              className="font-condensed text-[13px] font-bold uppercase tracking-[2px] text-warm-white bg-orange hover:bg-orange-hot px-6 py-3 transition-colors no-underline"
            >
              Browse Registry →
            </Link>
            <Link
              href="/studio/briefs"
              className="font-condensed text-[12px] font-bold uppercase tracking-[2px] text-silver hover:text-orange transition-colors no-underline"
            >
              Casting Briefs →
            </Link>
          </div>
        </div>

        {/* Saved talent */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange">
              Saved Talent ({validTalents.length})
            </div>
          </div>

          {validTalents.length === 0 ? (
            <div className="bg-dark-3 border border-dashed border-white/10 flex flex-col items-center justify-center py-24 text-center">
              <div className="font-display text-[48px] text-dark-2 leading-none mb-4">0</div>
              <div className="font-condensed text-[13px] font-semibold uppercase tracking-[2px] text-grey mb-3">
                No saved talent yet
              </div>
              <Link
                href="/studio/browse"
                className="font-condensed text-[12px] font-bold uppercase tracking-[2px] text-orange hover:text-orange-hot transition-colors no-underline"
              >
                Browse Registry →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0.5">
              {validTalents.map((t) => (
                <TalentCard
                  key={t.id}
                  id={t.id}
                  stage_name={t.stage_name}
                  location={t.location}
                  country={t.country}
                  gender={t.gender}
                  age_range={t.age_range}
                  categories={t.categories}
                  verified={t.verified}
                  imageUrl={t.imageUrl}
                  isSaved
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
