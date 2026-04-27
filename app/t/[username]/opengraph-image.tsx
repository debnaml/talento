import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Talento talent profile";

export default async function OG({
  params,
}: {
  params: { username: string };
}) {
  const supabase = await createClient();
  const { data: talent } = await supabase
    .from("talent_profiles")
    .select("stage_name, location, categories, talent_images(storage_path, is_primary)")
    .eq("username", params.username.toLowerCase())
    .eq("published", true)
    .maybeSingle();

  const name = (talent?.stage_name ?? "Talento").toUpperCase();
  const location = talent?.location ?? "";
  const categories = Array.isArray(talent?.categories)
    ? (talent!.categories as string[]).slice(0, 3).join(" · ").toUpperCase()
    : "";

  let bgUrl: string | null = null;
  const images = Array.isArray(talent?.talent_images) ? talent!.talent_images : [];
  const primary =
    images.find((i) => (i as { is_primary?: boolean }).is_primary) ?? images[0];
  if (primary) {
    const { data } = await supabase.storage
      .from("talent-images")
      .createSignedUrl((primary as { storage_path: string }).storage_path, 3600);
    bgUrl = data?.signedUrl ?? null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#0D0D10",
          color: "#F4F2EE",
          position: "relative",
        }}
      >
        {bgUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgUrl}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.55,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, #0D0D10 0%, rgba(13,13,16,0.7) 50%, rgba(13,13,16,0.2) 100%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 72,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 3, background: "#E8500A" }} />
            <div
              style={{
                fontSize: 20,
                letterSpacing: 6,
                color: "#E8500A",
                fontWeight: 800,
              }}
            >
              TALENTO
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 120,
                lineHeight: 1,
                letterSpacing: 3,
                fontWeight: 800,
              }}
            >
              {name}
            </div>
            {(location || categories) && (
              <div
                style={{
                  marginTop: 24,
                  fontSize: 26,
                  letterSpacing: 3,
                  color: "#A0A0B8",
                }}
              >
                {[categories, location].filter(Boolean).join("   ·   ")}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
