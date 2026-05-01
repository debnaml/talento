import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TalentProfileForm, type TalentProfileInitial } from "@/components/forms/TalentProfileForm";

export default async function TalentSettingsProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: talent } = await supabase
    .from("talent_profiles")
    .select(
      "stage_name, username, bio, location, country, age_range, gender, height_cm, categories, allows_film, allows_advertising, allows_gaming, allows_d2c, allows_political, allows_adult, featured_on_homepage"
    )
    .eq("id", user.id)
    .single();

  if (!talent) redirect("/talent/onboarding");

  const initial: TalentProfileInitial = {
    stage_name: talent.stage_name,
    username: talent.username ?? "",
    bio: talent.bio ?? "",    location: talent.location ?? "",
    country: talent.country ?? "",
    age_range: talent.age_range ?? "",
    gender: talent.gender ?? "",
    height_cm: talent.height_cm != null ? String(talent.height_cm) : "",
    categories: talent.categories ?? [],
    allows_film: talent.allows_film ?? true,
    allows_advertising: talent.allows_advertising ?? true,
    allows_gaming: talent.allows_gaming ?? true,
    allows_d2c: talent.allows_d2c ?? false,
    allows_political: talent.allows_political ?? false,
    allows_adult: talent.allows_adult ?? false,
    featured_on_homepage: talent.featured_on_homepage ?? false,
  };

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[680px] mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-6 h-0.5 bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              Settings
            </span>
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,56px)] tracking-[2px] text-warm-white leading-none">
            EDIT PROFILE
          </h1>
          <p className="font-body text-[14px] font-light text-grey mt-3">
            Update your details, categories, and consent preferences.
          </p>
        </div>

        <TalentProfileForm mode="settings" initial={initial} />
      </div>
    </div>
  );
}
