import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TalentFilters } from "@/components/talent/TalentFilters";
import { TalentCard } from "@/components/talent/TalentCard";
import { getBlockedUserIds } from "@/lib/blocks";

type SearchParams = {
  q?: string;
  category?: string;
  gender?: string;
  country?: string;
};

async function BrowseContent({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("talent_profiles")
    .select(
      "id, stage_name, location, country, gender, age_range, categories, verified, talent_images(storage_path, is_primary)"
    )
    .eq("published", true);

  if (searchParams.q) {
    query = query.or(
      `stage_name.ilike.%${searchParams.q}%,location.ilike.%${searchParams.q}%`
    );
  }
  if (searchParams.category) {
    query = query.contains("categories", [searchParams.category]);
  }
  if (searchParams.gender) {
    query = query.eq("gender", searchParams.gender as "male" | "female" | "non_binary" | "other" | "prefer_not");
  }
  if (searchParams.country) {
    query = query.eq("country", searchParams.country);
  }

  const { data: talents } = await query.limit(48);

  const blocked = await getBlockedUserIds();
  const filteredTalents = (talents ?? []).filter((t) => !blocked.has(t.id));

  // Generate signed URLs for primary images
  const enriched = await Promise.all(
    filteredTalents.map(async (t) => {
      // talent_images may be an array due to the join
      const images = Array.isArray(t.talent_images) ? t.talent_images : [];
      const primary = images.find((i) => i.is_primary) ?? images[0];
      if (!primary) return { ...t, imageUrl: null };
      const { data } = await supabase.storage
        .from("talent-images")
        .createSignedUrl(primary.storage_path, 3600);
      return { ...t, imageUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <>
      <TalentFilters resultCount={enriched.length} />

      {enriched.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="font-display text-[48px] text-dark-3 leading-none mb-4">0</div>
          <div className="font-condensed text-[13px] font-semibold uppercase tracking-[2px] text-grey mb-2">
            No talent found
          </div>
          <p className="font-body text-[13px] text-grey/60">
            Try adjusting the filters above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0.5">
          {enriched.map((t) => (
            <TalentCard
              key={t.id}
              id={t.id}
              stage_name={t.stage_name}
              location={t.location}
              country={t.country}
              gender={t.gender}
              age_range={t.age_range}
              categories={t.categories as string[] | null}
              verified={t.verified}
              imageUrl={t.imageUrl}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-dark">
      {/* Hero bar */}
      <div className="bg-dark-2 border-b border-white/[0.04] px-6 md:px-12 py-10">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-6 h-0.5 bg-orange" />
          <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
            Casting Registry
          </span>
        </div>
        <h1 className="font-display text-[clamp(48px,6vw,80px)] tracking-[2px] text-warm-white leading-none">
          FIND YOUR TALENT
        </h1>
        <p className="font-body text-[14px] font-light text-grey mt-3 max-w-lg">
          Every profile is consent-verified. Filter by category, location, and more.
        </p>
      </div>

      <div className="px-8 py-10">
        <Suspense fallback={<div className="font-condensed text-[12px] uppercase tracking-[2px] text-grey py-20 text-center">Loading…</div>}>
          <BrowseContent searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
