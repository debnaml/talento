import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StudioProfileForm, type StudioProfileInitial } from "@/components/forms/StudioProfileForm";

export default async function StudioSettingsProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: studio } = await supabase
    .from("studio_profiles")
    .select("company_name, studio_type, website, description, country, logo_url")
    .eq("id", user.id)
    .single();

  if (!studio) redirect("/studio/onboarding");

  let logoSignedUrl: string | null = null;
  if (studio.logo_url) {
    const { data } = await supabase.storage
      .from("studio-logos")
      .createSignedUrl(studio.logo_url, 3600);
    logoSignedUrl = data?.signedUrl ?? null;
  }

  const initial: StudioProfileInitial = {
    company_name: studio.company_name,
    studio_type: studio.studio_type,
    website: studio.website ?? "",
    description: studio.description ?? "",
    country: studio.country ?? "",
    logo_url: studio.logo_url ?? null,
    logo_signed_url: logoSignedUrl,
  };

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[560px] mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-6 h-0.5 bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              Settings
            </span>
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,56px)] tracking-[2px] text-warm-white leading-none">
            EDIT STUDIO
          </h1>
          <p className="font-body text-[14px] font-light text-grey mt-3">
            Update your company details and logo.
          </p>

        </div>

        <StudioProfileForm mode="settings" initial={initial} />
      </div>
    </div>
  );
}
