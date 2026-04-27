"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setServerError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <div className="w-full max-w-[440px]">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-6 h-0.5 bg-orange" />
          <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
            Account Recovery
          </span>
        </div>
        <h1 className="font-display text-[clamp(32px,4vw,48px)] tracking-[2px] text-warm-white leading-none">
          FORGOT PASSWORD
        </h1>
      </div>

      <div className="bg-dark-3 border-t-2 border-orange p-8">
        {sent ? (
          <div>
            <p className="font-body text-[14px] text-warm-white mb-3">
              Check your inbox.
            </p>
            <p className="font-body text-[13px] text-grey">
              If that email is registered, we&apos;ve sent a reset link. It expires in one hour.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-7">
              <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
                {...register("email")}
              />
              {errors.email && (
                <p className="font-condensed text-[11px] text-orange mt-1.5">
                  {errors.email.message}
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
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>

      <p className="text-center font-body text-[13px] text-grey mt-6">
        Remembered it?{" "}
        <Link href="/login" className="text-orange hover:text-orange-hot">
          Log in
        </Link>
      </p>
    </div>
  );
}
