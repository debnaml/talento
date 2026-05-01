import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { unpublishProfile } from "@/app/talent/upload/actions";

const CATEGORY_LABELS: Record<string, string> = {
  film: "Film", tv: "TV", advertising: "Advertising", gaming: "Gaming",
  d2c: "D2C", sports: "Sports", music: "Music", historical: "Historical",
  stunt: "Stunt", action: "Action", drama: "Drama", comedy: "Comedy",
};

export default async function TalentDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: talent } = await supabase
    .from("talent_profiles")
    .select("stage_name, location, categories, published, verified, username")
    .eq("id", user.id)
    .single();

  if (!talent) redirect("/talent/onboarding");

  const { data: images } = await supabase
    .from("talent_images")
    .select("id, storage_path, is_primary")
    .eq("talent_id", user.id)
    .order("is_primary", { ascending: false })
    .order("created_at")
    .limit(6);

  const withUrls = await Promise.all(
    (images ?? []).map(async (img) => {
      const { data } = await supabase.storage
        .from("talent-images")
        .createSignedUrl(img.storage_path, 3600);
      return { ...img, signedUrl: data?.signedUrl };
    })
  );

  // Media counts (videos + voice) for the profile-strength tile
  const { data: mediaRows } = await supabase
    .from("talent_media")
    .select("kind")
    .eq("talent_id", user.id);

  const videoCount = (mediaRows ?? []).filter((m) => m.kind === "video").length;
  const voiceCount = (mediaRows ?? []).filter((m) => m.kind === "voice").length;
  const photoCount = withUrls.length;

  const strengthSteps = [
    { key: "photo", label: "Photo", done: photoCount > 0 },
    { key: "video", label: "Video", done: videoCount > 0 },
    { key: "voice", label: "Voice", done: voiceCount > 0 },
  ];
  const strengthScore = strengthSteps.filter((s) => s.done).length;
  const strengthLabel =
    strengthScore === 0
      ? "Empty"
      : strengthScore === 1
      ? "Basic"
      : strengthScore === 2
      ? "Good"
      : "Complete";

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2.5 mb-3">
              <div className="w-6 h-0.5 bg-orange" />
              <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
                Talent Dashboard
              </span>
            </div>
            <h1 className="font-display text-[clamp(32px,4vw,52px)] tracking-[2px] text-warm-white leading-none">
              {talent.stage_name.toUpperCase()}
            </h1>
            {talent.location && (
              <p className="font-condensed text-[13px] text-grey mt-1.5 tracking-[1px]">
                {talent.location}
              </p>
            )}
          </div>

          {talent.published ? (
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 bg-dark-3 border border-success/30 px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-success">
                  Published
                </span>
              </div>
              {talent.username && (
                <Link
                  href={`/t/${talent.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-orange hover:text-orange-hot transition-colors no-underline"
                >
                  View public → /t/{talent.username}
                </Link>
              )}
              <form action={async () => { "use server"; await unpublishProfile(); }}>
                <button
                  type="submit"
                  className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-orange transition-colors"
                >
                  Unpublish
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/talent/upload"
              className="flex items-center gap-2 bg-dark-3 border border-orange/30 hover:border-orange px-4 py-2 transition-colors no-underline"
            >
              <div className="w-2 h-2 rounded-full bg-grey" />
              <span className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-orange transition-colors">
                Draft — Publish Now
              </span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 mb-0.5">
          {/* Profile tile */}
          <div className="col-span-2 bg-dark-3 p-7">
            <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange mb-4">
              Profile
            </div>

            {talent.categories && talent.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {talent.categories.map((cat) => (
                  <span
                    key={cat}
                    className="font-condensed text-[9px] font-bold uppercase tracking-[1.5px] px-2 py-1 border border-orange/25 text-orange"
                  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </span>
                ))}
              </div>
            )}

            {talent.verified && (
              <div className="inline-flex items-center gap-1.5 mb-4">
                <div className="w-4 h-4 bg-orange flex items-center justify-center text-[10px] text-white">
                  ✓
                </div>
                <span className="font-condensed text-[10px] font-bold uppercase tracking-[2px] text-orange">
                  Verified
                </span>
              </div>
            )}

            <Link
              href="/talent/settings/profile"
              className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-silver hover:text-orange transition-colors no-underline inline-flex items-center gap-2"
            >
              Edit Profile →
            </Link>
          </div>

          {/* Profile Strength tile */}
          <div className="bg-dark-3 p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange">
                Profile Strength
              </div>
              <div className="font-condensed text-[10px] font-bold uppercase tracking-[2px] text-warm-white">
                {strengthLabel}
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1 mb-5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`flex-1 h-1 ${
                    n <= strengthScore ? "bg-orange" : "bg-dark-2"
                  }`}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {strengthSteps.map((s) => (
                <div key={s.key} className="flex items-center justify-between">
                  <span
                    className={`font-condensed text-[12px] uppercase tracking-[1.5px] ${
                      s.done ? "text-warm-white" : "text-grey"
                    }`}
                  >
                    {s.label}
                  </span>
                  <span
                    className={`font-condensed text-[11px] font-bold uppercase tracking-[1px] ${
                      s.done ? "text-success" : "text-grey"
                    }`}
                  >
                    {s.done ? "✓ Added" : "Missing"}
                  </span>
                </div>
              ))}
            </div>

            {strengthScore < 3 && (
              <Link
                href="/talent/upload"
                className="mt-5 inline-flex font-condensed text-[11px] font-bold uppercase tracking-[2px] text-orange hover:text-orange-hot transition-colors no-underline"
              >
                Add media →
              </Link>
            )}
          </div>
        </div>

        {/* Photos strip */}
        <div className="bg-dark-3 p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange">
              Photos ({photoCount})
            </div>
            <Link
              href="/talent/upload"
              className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-silver hover:text-orange transition-colors no-underline"
            >
              Manage →
            </Link>
          </div>

          {withUrls.length === 0 ? (
            <Link
              href="/talent/upload"
              className="block border border-dashed border-orange/30 bg-orange/5 hover:border-orange hover:bg-orange/10 p-8 text-center transition-colors no-underline"
            >
              <div className="text-2xl text-orange mb-2">↑</div>
              <div className="font-condensed text-[12px] font-semibold uppercase tracking-[2px] text-silver">
                Upload your first photo
              </div>
            </Link>
          ) : (
            <div className="flex gap-0.5 overflow-x-auto">
              {withUrls.map((img) => (
                <div
                  key={img.id}
                  className="relative flex-shrink-0 w-24 aspect-[2/3] bg-dark-2 overflow-hidden"
                >
                  {img.signedUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.signedUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                  {img.is_primary && (
                    <div className="absolute bottom-0 left-0 right-0 bg-orange/90 font-condensed text-[8px] font-bold uppercase tracking-[1px] text-white text-center py-1">
                      Primary
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
