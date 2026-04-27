"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Role = "talent" | "studio";

const schema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      error: "You must accept the terms",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    if (!role) return;
    setLoading(true);
    setServerError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { role, full_name: values.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    // If session is null, email confirmation is required
    if (!data.session) {
      setCheckEmail(true);
      return;
    }

    router.push(
      role === "talent" ? "/talent/onboarding" : "/studio/onboarding"
    );
  }

  // ── Email confirmation pending ─────────────────────────────────────
  if (checkEmail) {
    return (
      <div className="w-full max-w-[440px] text-center">
        <div className="w-14 h-14 border-2 border-orange flex items-center justify-center text-2xl text-orange mx-auto mb-6">
          ✉
        </div>
        <h1 className="font-display text-[clamp(28px,4vw,40px)] tracking-[2px] text-warm-white leading-none mb-4">
          CHECK YOUR EMAIL
        </h1>
        <p className="font-body text-[14px] font-light text-silver leading-relaxed mb-6">
          We sent a confirmation link to your inbox. Click it to activate your
          account and continue to your profile setup.
        </p>
        <p className="font-condensed text-[11px] uppercase tracking-[2px] text-grey">
          Already confirmed?{" "}
          <a
            href="/login"
            className="text-orange hover:text-orange-hot transition-colors"
          >
            Log in →
          </a>
        </p>
      </div>
    );
  }

  // ── Step 1: Role picker ──────────────────────────────────────────────
  if (!role) {
    return (
      <div className="w-full max-w-[760px]">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-6 h-0.5 bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              Create Account
            </span>
            <div className="w-6 h-0.5 bg-orange" />
          </div>
          <h1 className="font-display text-[clamp(36px,5vw,56px)] tracking-[2px] text-warm-white leading-none">
            WHO ARE YOU?
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
          {/* Talent tile */}
          <button
            onClick={() => setRole("talent")}
            className="group bg-dark-3 border-t-2 border-transparent hover:border-orange p-10 text-left transition-all hover:bg-mid cursor-pointer"
          >
            <div className="w-11 h-11 border border-orange flex items-center justify-center text-orange text-xl mb-6 group-hover:bg-orange group-hover:text-dark transition-colors">
              ↑
            </div>
            <div className="font-display text-[32px] tracking-[1.5px] text-warm-white mb-2 leading-none">
              I&apos;M TALENT
            </div>
            <p className="font-body text-[14px] font-light text-silver leading-relaxed">
              Upload your likeness. Set what you allow. Earn passively every
              time AI uses your face, voice, or body.
            </p>
            <div className="font-condensed text-[12px] font-bold uppercase tracking-[2px] text-orange mt-6 inline-flex items-center gap-2">
              Get started →
            </div>
          </button>

          {/* Studio tile */}
          <button
            onClick={() => setRole("studio")}
            className="group bg-dark-3 border-t-2 border-transparent hover:border-orange p-10 text-left transition-all hover:bg-mid cursor-pointer"
          >
            <div className="w-11 h-11 border border-orange flex items-center justify-center text-orange text-xl mb-6 group-hover:bg-orange group-hover:text-dark transition-colors">
              ◎
            </div>
            <div className="font-display text-[32px] tracking-[1.5px] text-warm-white mb-2 leading-none">
              I&apos;M A STUDIO
            </div>
            <p className="font-body text-[14px] font-light text-silver leading-relaxed">
              Search consented, verified talent. License instantly for film,
              advertising, gaming, or D2C. Every transaction fully auditable.
            </p>
            <div className="font-condensed text-[12px] font-bold uppercase tracking-[2px] text-orange mt-6 inline-flex items-center gap-2">
              Browse talent →
            </div>
          </button>
        </div>

        <p className="text-center font-body text-[13px] text-grey mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-orange hover:text-orange-hot">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  // ── Step 2: Credentials form ─────────────────────────────────────────
  return (
    <div className="w-full max-w-[480px]">
      <button
        onClick={() => setRole(null)}
        className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-silver transition-colors mb-8 flex items-center gap-2"
      >
        ← Back
      </button>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-6 h-0.5 bg-orange" />
          <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
            {role === "talent" ? "Talent Account" : "Studio Account"}
          </span>
        </div>
        <h1 className="font-display text-[clamp(32px,4vw,48px)] tracking-[2px] text-warm-white leading-none">
          CREATE ACCOUNT
        </h1>
      </div>

      <div className="bg-dark-3 border-t-2 border-orange p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Full name */}
          <div className="mb-5">
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Full Name
            </label>
            <input
              type="text"
              autoComplete="name"
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="font-condensed text-[11px] text-orange mt-1.5">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-5">
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

          {/* Password */}
          <div className="mb-5">
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Password
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

          {/* Confirm password */}
          <div className="mb-6">
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="font-condensed text-[11px] text-orange mt-1.5">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="mb-7">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 accent-orange flex-shrink-0"
                {...register("terms")}
              />
              <span className="font-body text-[13px] font-light text-silver leading-snug">
                I agree to the{" "}
                <Link href="/terms" className="text-orange hover:text-orange-hot">
                  Talent Agreement
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-orange hover:text-orange-hot">
                  Privacy Policy
                </Link>
                . My data is never sold.
              </span>
            </label>
            {errors.terms && (
              <p className="font-condensed text-[11px] text-orange mt-1.5">
                {errors.terms.message}
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
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </form>
      </div>

      <p className="text-center font-body text-[13px] text-grey mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-orange hover:text-orange-hot">
          Log in
        </Link>
      </p>
    </div>
  );
}
