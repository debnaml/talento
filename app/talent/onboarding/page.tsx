import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TalentProfileForm } from "@/components/forms/TalentProfileForm";

export default async function TalentOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[680px] mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-6 h-0.5 bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              Step 1 of 2
            </span>
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,56px)] tracking-[2px] text-warm-white leading-none">
            YOUR PROFILE
          </h1>
          <p className="font-body text-[14px] font-light text-grey mt-3">
            Takes two minutes. You can edit this any time.
          </p>
        </div>

        <TalentProfileForm mode="onboarding" />
      </div>
    </div>
  );
}
