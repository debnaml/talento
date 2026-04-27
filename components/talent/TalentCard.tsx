import Link from "next/link";

const CATEGORY_LABELS: Record<string, string> = {
  film: "Film", tv: "TV", advertising: "Adv", gaming: "Gaming",
  d2c: "D2C", sports: "Sports", music: "Music", historical: "Historical",
  stunt: "Stunt", action: "Action", drama: "Drama", comedy: "Comedy",
};

type TalentCardProps = {
  id: string;
  stage_name: string;
  location: string | null;
  country: string | null;
  gender: string | null;
  age_range: string | null;
  categories: string[] | null;
  verified: boolean | null;
  imageUrl: string | null;
  isSaved?: boolean;
};

export function TalentCard({
  id,
  stage_name,
  location,
  gender,
  age_range,
  categories,
  verified,
  imageUrl,
}: TalentCardProps) {
  const meta = [gender, age_range, location].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/studio/talent/${id}`}
      className="group bg-dark-3 block overflow-hidden no-underline transition-transform hover:scale-[1.02] hover:z-[2] relative"
    >
      {/* Face / image area */}
      <div className="aspect-[2/3] relative overflow-hidden bg-dark-2">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={stage_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-end pb-3 justify-center">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg,rgba(232,80,10,.08) 0%,rgba(13,13,16,.95) 80%), radial-gradient(ellipse at 50% 30%,rgba(232,80,10,.12) 0%,transparent 60%)",
              }}
            />
            <div
              className="absolute"
              style={{
                top: "12%", left: "50%", transform: "translateX(-50%)",
                width: "52%", paddingBottom: "65%", borderRadius: "50% 50% 44% 44%",
                background: "rgba(255,255,255,0.055)",
              }}
            />
          </div>
        )}

        {verified && (
          <div className="absolute top-2 right-2 bg-orange w-5 h-5 flex items-center justify-center text-[9px] text-white font-bold">
            ✓
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 pt-2.5 pb-3 bg-dark-2">
        <div className="font-condensed text-[13px] font-bold uppercase tracking-[0.5px] text-warm-white mb-0.5 truncate">
          {stage_name}
        </div>
        {meta && (
          <div className="font-condensed text-[10px] tracking-[1px] text-grey mb-2 truncate">
            {meta}
          </div>
        )}

        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="font-condensed text-[8px] font-bold uppercase tracking-[1.5px] px-1.5 py-0.5 border border-orange/25 text-orange"
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </span>
            ))}
            {categories.length > 3 && (
              <span className="font-condensed text-[8px] font-bold uppercase tracking-[1.5px] px-1.5 py-0.5 border border-white/[0.07] text-grey">
                +{categories.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="w-full font-condensed text-[9px] font-bold uppercase tracking-[1.5px] text-orange border border-orange/30 group-hover:bg-orange group-hover:text-white group-hover:border-orange py-1.5 text-center transition-colors">
          View Profile
        </div>
      </div>
    </Link>
  );
}
