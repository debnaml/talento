import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const CATEGORY_LABELS: Record<string, string> = {
  film: "Film", tv: "TV", advertising: "Advertising", gaming: "Gaming",
  d2c: "D2C", sports: "Sports", music: "Music", historical: "Historical",
  stunt: "Stunt", action: "Action", drama: "Drama", comedy: "Comedy",
};

// Placeholder cards used to fill any remaining slots when fewer than 5
// talents have opted in to homepage feature.
const PLACEHOLDERS = [
  { name: "Sarah M.", type: "Film · Advertising", bg: "linear-gradient(180deg, rgba(180,140,100,0.15) 0%, rgba(13,13,16,0.95) 70%), radial-gradient(ellipse at 50% 35%, rgba(200,160,120,0.2) 0%, transparent 55%), #111118" },
  { name: "James K.", type: "Action · Gaming",    bg: "linear-gradient(180deg, rgba(100,140,180,0.1) 0%, rgba(13,13,16,0.95) 70%), radial-gradient(ellipse at 50% 35%, rgba(120,160,200,0.15) 0%, transparent 55%), #0f1218" },
  { name: "Priya R.", type: "D2C · Advertising",  bg: "linear-gradient(180deg, rgba(200,160,100,0.18) 0%, rgba(13,13,16,0.95) 70%), radial-gradient(ellipse at 50% 30%, rgba(220,180,120,0.2) 0%, transparent 55%), #131008" },
  { name: "Marcus T.", type: "Sports · Film",     bg: "linear-gradient(180deg, rgba(140,100,180,0.12) 0%, rgba(13,13,16,0.95) 70%), radial-gradient(ellipse at 50% 35%, rgba(160,120,200,0.15) 0%, transparent 55%), #100d16" },
  { name: "Aiko N.", type: "Gaming · D2C",        bg: "linear-gradient(180deg, rgba(100,180,140,0.1) 0%, rgba(13,13,16,0.95) 70%), radial-gradient(ellipse at 50% 30%, rgba(120,200,160,0.12) 0%, transparent 55%), #0d1210" },
];

const SLOT_COUNT = 5;

type RealTalent = {
  id: string;
  stage_name: string;
  categories: string[] | null;
  imageUrl: string | null;
};

async function fetchFeaturedTalent(): Promise<RealTalent[]> {
  try {
    const supabase = await createClient();
    const { data: rows } = await supabase
      .from("talent_profiles")
      .select("id, stage_name, categories, talent_images(storage_path, is_primary)")
      .eq("published", true)
      .eq("featured_on_homepage", true)
      .limit(SLOT_COUNT);

    if (!rows || rows.length === 0) return [];

    return await Promise.all(
      rows.map(async (t) => {
        const images = Array.isArray(t.talent_images) ? t.talent_images : [];
        const primary = images.find((i) => i.is_primary) ?? images[0];
        let imageUrl: string | null = null;
        if (primary?.storage_path) {
          const { data } = await supabase.storage
            .from("talent-images")
            .createSignedUrl(primary.storage_path, 3600);
          imageUrl = data?.signedUrl ?? null;
        }
        return {
          id: t.id,
          stage_name: t.stage_name,
          categories: (t.categories as string[] | null) ?? null,
          imageUrl,
        };
      }),
    );
  } catch {
    return [];
  }
}

function categoryLabel(cats: string[] | null): string {
  if (!cats || cats.length === 0) return "Talent";
  return cats.slice(0, 2).map((c) => CATEGORY_LABELS[c] ?? c).join(" · ");
}

export async function TalentPreviewGrid() {
  const real = await fetchFeaturedTalent();
  const placeholders = PLACEHOLDERS.slice(0, Math.max(0, SLOT_COUNT - real.length));

  return (
    <section className="bg-dark px-6 md:px-12 py-24">
      {/* Header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-px bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              The Registry
            </span>
          </div>
          <h2 className="font-display text-[clamp(40px,5vw,64px)] tracking-[2px] text-warm-white leading-none">
            Browse Talent
          </h2>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["Film", "Advertising", "Gaming", "D2C", "Sports"].map((tag) => (
            <span
              key={tag}
              className="font-condensed text-[10px] font-bold uppercase tracking-[2px] px-2.5 py-0.5 border border-orange/40 text-orange"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Grid — 6 cols: 5 talent + 1 CTA */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-0.5">
        {real.map((t) => (
          <article
            key={t.id}
            className="relative aspect-[2/3] bg-dark-3 overflow-hidden transition-transform hover:scale-[1.03] hover:z-[2]"
          >
            {t.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={t.imageUrl}
                alt={t.stage_name}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-dark-2" />
            )}

            {/* Verified tick */}
            <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-orange flex items-center justify-center text-white text-[10px]">
              ✓
            </div>

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-dark/[0.98] via-dark/60 to-transparent">
              <div className="font-condensed text-[13px] font-bold uppercase tracking-[1px] text-warm-white">
                {t.stage_name}
              </div>
              <div className="font-condensed text-[10px] uppercase tracking-[1.5px] text-grey mt-0.5">
                {categoryLabel(t.categories)}
              </div>
            </div>
          </article>
        ))}

        {placeholders.map((t) => (
          <article
            key={t.name}
            className="relative aspect-[2/3] bg-dark-3 overflow-hidden transition-transform hover:scale-[1.03] hover:z-[2]"
            aria-hidden="true"
          >
            <div className="absolute inset-0" style={{ background: t.bg }} />
            <div
              className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[52%] rounded-[50%_50%_44%_44%] bg-white/[0.07]"
              style={{ paddingBottom: "65%", boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.3)" }}
            />
            <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-orange flex items-center justify-center text-white text-[10px]">
              ✓
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-dark/[0.98] to-transparent">
              <div className="font-condensed text-[13px] font-bold uppercase tracking-[1px] text-warm-white">
                {t.name}
              </div>
              <div className="font-condensed text-[10px] uppercase tracking-[1.5px] text-grey mt-0.5">
                {t.type}
              </div>
            </div>
          </article>
        ))}

        {/* CTA card */}
        <div className="relative aspect-[2/3] bg-dark-3 flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-mid transition-colors">
          <div className="font-display text-[42px] text-orange leading-none">48K+</div>
          <div className="font-condensed text-[11px] font-semibold uppercase tracking-[2.5px] text-grey my-2">
            Talents Available
          </div>
          <Link
            href="/for-studios"
            className="font-condensed text-[12px] font-bold uppercase tracking-[2px] text-orange no-underline inline-flex items-center gap-1"
          >
            Browse All →
          </Link>
        </div>
      </div>
    </section>
  );
}

