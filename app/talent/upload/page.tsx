import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ImageUploader } from "@/components/forms/ImageUploader";
import { VideoUploader } from "@/components/forms/VideoUploader";
import { VoiceUploader } from "@/components/forms/VoiceUploader";
import { MediaTabs } from "@/components/forms/MediaTabs";
import { publishProfile } from "./actions";

export default async function TalentUploadPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Ensure onboarding is done
  const { data: profile } = await supabase
    .from("talent_profiles")
    .select("stage_name, published")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/talent/onboarding");

  // Photos
  const { data: images } = await supabase
    .from("talent_images")
    .select("*")
    .eq("talent_id", user.id)
    .order("sort_order")
    .order("created_at");

  const photosWithUrls = await Promise.all(
    (images ?? []).map(async (img) => {
      const { data } = await supabase.storage
        .from("talent-images")
        .createSignedUrl(img.storage_path, 3600);
      return { ...img, signedUrl: data?.signedUrl };
    })
  );

  // Videos + voice (single query, split below)
  const { data: media } = await supabase
    .from("talent_media")
    .select("*")
    .eq("talent_id", user.id)
    .order("created_at");

  const videoBucket = supabase.storage.from("talent-video");
  const voiceBucket = supabase.storage.from("talent-voice");

  const mediaWithUrls = await Promise.all(
    (media ?? []).map(async (m) => {
      const bucket = m.kind === "video" ? videoBucket : voiceBucket;
      const { data } = await bucket.createSignedUrl(m.storage_path, 3600);
      return { ...m, signedUrl: data?.signedUrl };
    })
  );

  const videos = mediaWithUrls.filter((m) => m.kind === "video");
  const voice = mediaWithUrls.filter((m) => m.kind === "voice");

  const imageCount = photosWithUrls.length;

  async function handlePublish() {
    "use server";
    await publishProfile();
  }

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[900px] mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-6 h-0.5 bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              Step 2 of 2
            </span>
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,56px)] tracking-[2px] text-warm-white leading-none">
            YOUR MEDIA
          </h1>
          <p className="font-body text-[14px] font-light text-grey mt-3 max-w-[560px]">
            Upload at least one photo to publish. Videos and voice clips make your profile
            stronger — studios filter for talent who&apos;ve provided them.
          </p>
        </div>

        <MediaTabs
          counts={{
            photos: imageCount,
            videos: videos.length,
            voice: voice.length,
          }}
          photos={<ImageUploader talentId={user.id} initialImages={photosWithUrls} />}
          videos={<VideoUploader talentId={user.id} initialMedia={videos} />}
          voice={<VoiceUploader talentId={user.id} initialMedia={voice} />}
        />

        {/* Publish / status */}
        <div className="bg-dark-3 border-t-2 border-orange p-6 flex items-center justify-between gap-4 mt-10 flex-wrap">
          <div>
            <div className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-silver mb-1">
              Registry Status
            </div>
            {profile.published ? (
              <div className="font-condensed text-[13px] font-semibold uppercase tracking-[1px] text-green-400">
                ● Published — visible in registry
              </div>
            ) : (
              <div className="font-condensed text-[13px] text-grey">
                Draft — not yet visible
              </div>
            )}
          </div>

          {!profile.published && (
            <form action={handlePublish}>
              <button
                type="submit"
                disabled={imageCount < 1}
                className="font-condensed text-[13px] font-bold uppercase tracking-[2px] text-warm-white bg-orange hover:bg-orange-hot disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3 transition-colors"
              >
                {imageCount < 1 ? "Upload an image first" : "Publish to Registry →"}
              </button>
            </form>
          )}

          {profile.published && (
            <Link
              href="/talent/dashboard"
              className="font-condensed text-[13px] font-bold uppercase tracking-[2px] text-orange hover:text-orange-hot transition-colors"
            >
              Go to Dashboard →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
