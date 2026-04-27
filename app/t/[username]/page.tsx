import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isBlocked } from "@/lib/blocks";

const CATEGORY_LABELS: Record<string, string> = {
  film: "Film", tv: "TV", advertising: "Advertising", gaming: "Gaming",
  d2c: "D2C", sports: "Sports", music: "Music", historical: "Historical",
  stunt: "Stunt", action: "Action", drama: "Drama", comedy: "Comedy",
};

const CONSENT_LABELS: Array<[string, string]> = [
  ["allows_film", "Film & TV"],
  ["allows_advertising", "Advertising"],
  ["allows_gaming", "Gaming"],
  ["allows_d2c", "D2C / E-commerce"],
  ["allows_political", "Political Content"],
  ["allows_adult", "Adult Content"],
];

async function loadTalent(username: string) {
  const supabase = await createClient();
  const uname = username.toLowerCase();
  const { data: talent } = await supabase
    .from("talent_profiles")
    .select("*, talent_images(*)")
    .eq("username", uname)
    .eq("published", true)
    .maybeSingle();
  return { supabase, talent };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const { talent } = await loadTalent(username);
  if (!talent) return { title: "Talent not found · Talento" };
  const title = `${talent.stage_name} · Talento`;
  const description =
    talent.bio?.slice(0, 160) ??
    `${talent.stage_name} on Talento — licensed likeness for film, advertising and more.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicTalentPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { supabase, talent } = await loadTalent(username);
  if (!talent) notFound();

  // If an authenticated viewer is blocked either-way, treat as not found
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && user.id !== talent.id && (await isBlocked(user.id, talent.id))) {
    notFound();
  }

  const images = Array.isArray(talent.talent_images) ? talent.talent_images : [];
  const withUrls = await Promise.all(
    images.map(async (img: { id: string; storage_path: string; is_primary: boolean | null }) => {
      const { data } = await supabase.storage
        .from("talent-images")
        .createSignedUrl(img.storage_path, 3600);
      return { ...img, signedUrl: data?.signedUrl };
    })
  );

  const { data: mediaRows } = await supabase
    .from("talent_media")
    .select("id, kind, storage_path, duration_seconds, label")
    .eq("talent_id", talent.id)
    .order("created_at");

  const videoBucket = supabase.storage.from("talent-video");
  const voiceBucket = supabase.storage.from("talent-voice");
  const mediaWithUrls = await Promise.all(
    (mediaRows ?? []).map(async (m) => {
      const bucket = m.kind === "video" ? videoBucket : voiceBucket;
      const { data } = await bucket.createSignedUrl(m.storage_path, 3600);
      return { ...m, signedUrl: data?.signedUrl };
    })
  );
  const videos = mediaWithUrls.filter((m) => m.kind === "video");
  const voices = mediaWithUrls.filter((m) => m.kind === "voice");

  const primaryImage = withUrls.find((i) => i.is_primary) ?? withUrls[0];
  const galleryImages = withUrls.filter((i) => !i.is_primary);

  const meta = [talent.gender, talent.age_range, talent.location].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen bg-dark">
      {/* Hero */}
      <div className="relative bg-dark-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/60 to-transparent z-10" />

        {primaryImage?.signedUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage.signedUrl}
            alt={talent.stage_name}
            className="absolute right-0 top-0 h-full w-1/2 object-cover object-top"
          />
        )}

        <div className="relative z-20 px-6 md:px-12 py-16 max-w-[580px]">
          <div className="mb-4">
            <Link
              href="/"
              className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-orange transition-colors no-underline"
            >
              ← Talento
            </Link>
          </div>

          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-6 h-0.5 bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              Talent Profile
            </span>
          </div>

          <h1 className="font-display text-[clamp(48px,6vw,88px)] tracking-[2px] text-warm-white leading-none mb-3">
            {talent.stage_name.toUpperCase()}
          </h1>

          {meta && (
            <p className="font-condensed text-[13px] tracking-[1.5px] text-silver mb-5">
              {meta}
            </p>
          )}

          {talent.categories && talent.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {(talent.categories as string[]).map((cat) => (
                <span
                  key={cat}
                  className="font-condensed text-[10px] font-bold uppercase tracking-[1.5px] px-2.5 py-1 border border-orange/30 text-orange"
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                </span>
              ))}
            </div>
          )}

          {talent.verified && (
            <div className="inline-flex items-center gap-1.5 mb-6">
              <div className="w-4 h-4 bg-orange flex items-center justify-center text-[10px] text-white">✓</div>
              <span className="font-condensed text-[10px] font-bold uppercase tracking-[2px] text-orange">
                Verified
              </span>
            </div>
          )}

          {/* Studio CTA */}
          <div className="border-t border-white/10 pt-6 mt-2 max-w-[420px]">
            <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-grey mb-2">
              Studios
            </div>
            <p className="font-body text-[13px] font-light text-silver mb-3 leading-snug">
              Log in to save this talent and send a message.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="font-condensed text-[13px] font-bold uppercase tracking-[2px] px-5 py-2.5 bg-orange text-white hover:bg-orange-hot transition-colors no-underline"
              >
                Studio Log In
              </Link>
              <Link
                href="/register?role=studio"
                className="font-condensed text-[13px] font-bold uppercase tracking-[2px] px-5 py-2.5 border border-white/15 text-silver hover:border-orange hover:text-orange transition-colors no-underline"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-3 gap-0.5 max-w-[1200px]">
        <div className="col-span-2 flex flex-col gap-0.5">
          {talent.bio && (
            <div className="bg-dark-3 p-7">
              <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange mb-4">
                About
              </div>
              <p className="font-body text-[14px] font-light text-silver leading-relaxed">
                {talent.bio}
              </p>
            </div>
          )}

          {galleryImages.length > 0 && (
            <div className="bg-dark-3 p-7">
              <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange mb-4">
                Gallery
              </div>
              <div className="flex gap-0.5 flex-wrap">
                {galleryImages.map((img) => (
                  <div
                    key={img.id}
                    className="w-[calc(33%-2px)] aspect-[2/3] bg-dark-2 overflow-hidden"
                  >
                    {img.signedUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.signedUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {videos.length > 0 && (
            <div className="bg-dark-3 p-7">
              <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange mb-4">
                Reels ({videos.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
                {videos.map((v) => (
                  <div key={v.id} className="bg-dark-2">
                    <div className="relative aspect-video bg-dark">
                      {v.signedUrl && (
                        <video
                          src={v.signedUrl}
                          controls
                          preload="metadata"
                          className="w-full h-full"
                        />
                      )}
                    </div>
                    {(v.label || v.duration_seconds != null) && (
                      <div className="px-3 py-2 font-condensed text-[12px] text-silver flex items-center justify-between gap-2">
                        <span className="truncate">{v.label || "Untitled"}</span>
                        {v.duration_seconds != null && (
                          <span className="text-grey text-[11px]">
                            {Math.round(v.duration_seconds)}s
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {voices.length > 0 && (
            <div className="bg-dark-3 p-7">
              <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange mb-4">
                Voice ({voices.length})
              </div>
              <div className="flex flex-col gap-2">
                {voices.map((vo) => (
                  <div key={vo.id} className="bg-dark-2 p-3 flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-[220px]">
                      {vo.signedUrl && (
                        <audio src={vo.signedUrl} controls preload="metadata" className="w-full" />
                      )}
                    </div>
                    <div className="font-condensed text-[12px] text-silver flex items-center gap-2">
                      <span>{vo.label || "Untitled"}</span>
                      {vo.duration_seconds != null && (
                        <span className="text-grey text-[11px]">
                          · {Math.round(vo.duration_seconds)}s
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="bg-dark-3 p-6">
            <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange mb-4">
              Consent
            </div>
            <div className="flex flex-col gap-0">
              {CONSENT_LABELS.map(([field, label]) => {
                const allowed = talent[field as keyof typeof talent] as boolean | null;
                return (
                  <div
                    key={field}
                    className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0"
                  >
                    <span className="font-condensed text-[11px] uppercase tracking-[1px] text-silver">
                      {label}
                    </span>
                    <span
                      className={`font-condensed text-[10px] font-bold uppercase tracking-[1px] ${
                        allowed ? "text-green-400" : "text-grey"
                      }`}
                    >
                      {allowed ? "✓ Yes" : "✗ No"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-dark-3 p-6">
            <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange mb-4">
              Details
            </div>
            <div className="flex flex-col gap-3">
              {[
                ["Gender", talent.gender],
                ["Age Range", talent.age_range],
                ["Height", talent.height_cm ? `${talent.height_cm} cm` : null],
                ["Location", talent.location],
                ["Country", talent.country],
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label}>
                    <div className="font-condensed text-[9px] font-bold uppercase tracking-[2px] text-grey mb-0.5">
                      {label}
                    </div>
                    <div className="font-condensed text-[13px] text-warm-white tracking-[0.5px]">
                      {String(value)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
