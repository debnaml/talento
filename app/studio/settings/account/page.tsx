import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AccountSettingsForm } from "@/components/forms/AccountSettingsForm";

export default async function StudioSettingsAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[560px] mx-auto">
        <div className="mb-10">
          <Link
            href="/studio/dashboard"
            className="inline-flex items-center gap-1.5 font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-orange transition-colors no-underline mb-4"
          >
            ← Dashboard
          </Link>
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-6 h-0.5 bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              Settings
            </span>
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,56px)] tracking-[2px] text-warm-white leading-none">
            ACCOUNT
          </h1>
          <p className="font-body text-[14px] font-light text-grey mt-3">
            Manage your email, password, and account lifecycle.
          </p>
        </div>

        <AccountSettingsForm
          currentEmail={user.email ?? ""}
          role="studio"
        />
      </div>
    </div>
  );
}
