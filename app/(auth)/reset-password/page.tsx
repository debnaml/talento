"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Supabase sends the user here with a recovery token in the URL hash
  // (or via PKCE code). The client picks it up automatically on load.
  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // Also check if we already have a session (e.g. page reload).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setServerError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div className="w-full max-w-[440px]">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-6 h-0.5 bg-orange" />
          <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
            Reset Password
          </span>
        </div>
        <h1 className="font-display text-[clamp(32px,4vw,48px)] tracking-[2px] text-warm-white leading-none">
          NEW PASSWORD
        </h1>
      </div>

      <div className="bg-dark-3 border-t-2 border-orange p-8">
        {done ? (
          <div>
            <p className="font-body text-[14px] text-warm-white mb-2">
              Password updated.
            </p>
            <p className="font-body text-[13px] text-grey">
              Redirecting you to log in…
            </p>
          </div>
        ) : !ready ? (
          <div>
            <p className="font-body text-[14px] text-warm-white mb-2">
              Verifying reset link…
            </p>
            <p className="font-body text-[13px] text-grey">
              If this takes more than a few seconds the link may have expired.{" "}
              <Link
                href="/forgot-password"
                className="text-orange hover:text-orange-hot"
              >
                Request a new one
              </Link>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-5">
              <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
                New Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
                {...register("password")}
              />
              {errors.password && (
                <p className="font-condensed text-[11px] text-orange mt-1.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="mb-7">
              <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
                {...register("confirm")}
              />
              {errors.confirm && (
                <p className="font-condensed text-[11px] text-orange mt-1.5">
                  {errors.confirm.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="bg-orange/10 border border-orange/30 px-4 py-3 mb-5">
                <p className="font-condensed text-[12px] text-orange">
                  {serverError}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-condensed text-[14px] font-bold uppercase tracking-[2.5px] text-warm-white bg-orange hover:bg-orange-hot disabled:opacity-50 disabled:cursor-not-allowed px-9 py-4 transition-colors"
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
