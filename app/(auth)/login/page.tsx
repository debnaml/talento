"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setServerError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    setLoading(false);

    if (error) {
      setServerError("Invalid email or password.");
      return;
    }

    // Redirect to next param, or role-based default
    if (next) {
      router.push(next);
      return;
    }

    const role = data.user?.user_metadata?.role as string | undefined;

    // Check if onboarded
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded, role")
      .eq("id", data.user.id)
      .single();

    if (!profile?.onboarded) {
      router.push(
        profile?.role === "studio" ? "/studio/onboarding" : "/talent/onboarding"
      );
    } else {
      router.push(role === "studio" ? "/studio/dashboard" : "/talent/dashboard");
    }
  }

  return (
    <div className="w-full max-w-[440px]">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-6 h-0.5 bg-orange" />
          <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
            Welcome Back
          </span>
        </div>
        <h1 className="font-display text-[clamp(32px,4vw,48px)] tracking-[2px] text-warm-white leading-none">
          LOG IN
        </h1>
      </div>

      <div className="bg-dark-3 border-t-2 border-orange p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

          <div className="mb-7">
            <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white font-body text-sm focus:border-orange focus:outline-none transition-colors"
              {...register("password")}
            />
            {errors.password && (
              <p className="font-condensed text-[11px] text-orange mt-1.5">
                {errors.password.message}
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
            {loading ? "Logging in…" : "Log In"}
          </button>

          <div className="mt-5 text-center">
            <Link
              href="/forgot-password"
              className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-grey hover:text-orange transition-colors no-underline"
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </div>

      <p className="text-center font-body text-[13px] text-grey mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-orange hover:text-orange-hot">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
