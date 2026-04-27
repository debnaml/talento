import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudioProfileForm } from "@/components/forms/StudioProfileForm";

export default async function StudioOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[560px] mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-6 h-0.5 bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              Studio Setup
            </span>
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,56px)] tracking-[2px] text-warm-white leading-none">
            YOUR STUDIO
          </h1>
          <p className="font-body text-[14px] font-light text-grey mt-3">
            Takes one minute. You can update this any time.
          </p>
        </div>

        <StudioProfileForm mode="onboarding" />
      </div>
    </div>
  );
}
