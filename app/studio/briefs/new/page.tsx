import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BriefForm } from "@/components/forms/BriefForm";
import { createBrief } from "../actions";

export default async function NewBriefPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[680px] mx-auto">
        <div className="mb-10">
          <Link
            href="/studio/briefs"
            className="inline-flex items-center gap-1.5 font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-orange transition-colors no-underline mb-4"
          >
            ← Briefs
          </Link>
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-6 h-0.5 bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              New Brief
            </span>
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,56px)] tracking-[2px] text-warm-white leading-none">
            CREATE BRIEF
          </h1>
          <p className="font-body text-[14px] font-light text-grey mt-3">
            Describe the role. We&apos;ll match talent you can invite.
          </p>
        </div>
        <BriefForm mode="new" action={createBrief} />
      </div>
    </div>
  );
}
