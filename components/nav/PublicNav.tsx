"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function PublicNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-6 md:px-12 h-[72px] bg-gradient-to-b from-dark/[0.98] to-transparent">
      <Link
        href="/"
        className="font-display text-[24px] md:text-[28px] tracking-[3px] text-warm-white no-underline"
      >
        TALEN<span className="text-orange">T</span>O
      </Link>

      {/* Desktop links */}
      <ul className="hidden md:flex gap-10 list-none m-0 p-0">
        <li>
          <Link
            href="/become-talent"
            className="font-condensed text-[13px] font-semibold uppercase tracking-[2.5px] text-silver hover:text-warm-white transition-colors no-underline"
          >
            Become Talent
          </Link>
        </li>
        <li>
          <Link
            href="/for-studios"
            className="font-condensed text-[13px] font-semibold uppercase tracking-[2.5px] text-silver hover:text-warm-white transition-colors no-underline"
          >
            For Studios
          </Link>
        </li>
        <li>
          {/* STAGE 2 — see STAGE-2-AUCTIONS.md */}
          <Link
            href="/auctions"
            className="font-condensed text-[13px] font-semibold uppercase tracking-[2.5px] text-silver hover:text-warm-white transition-colors no-underline"
          >
            Auctions
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className="font-condensed text-[13px] font-semibold uppercase tracking-[2.5px] text-silver hover:text-warm-white transition-colors no-underline"
          >
            About
          </Link>
        </li>
      </ul>

      {/* Desktop auth buttons */}
      <div className="hidden md:flex items-center gap-3">
        <Link
          href="/login"
          className="font-condensed text-[13px] font-bold uppercase tracking-[2px] text-silver hover:text-warm-white border border-white/20 hover:border-white/40 px-5 py-2.5 transition-colors no-underline"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="font-condensed text-[13px] font-bold uppercase tracking-[2px] text-warm-white bg-orange hover:bg-orange-hot px-6 py-2.5 transition-colors no-underline"
        >
          Sign Up
        </Link>
      </div>

      {/* Mobile burger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="md:hidden flex flex-col justify-center gap-[5px] w-6 h-10 z-[101]"
      >
        <span
          className={`block w-6 h-[2px] bg-warm-white transition-transform ${
            open ? "translate-y-[7px] rotate-45" : ""
          }`}
        />
        <span
          className={`block w-6 h-[2px] bg-orange transition-opacity ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block w-6 h-[2px] bg-warm-white transition-transform ${
            open ? "-translate-y-[7px] -rotate-45" : ""
          }`}
        />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 top-[72px] bg-dark z-[99] flex flex-col">
          <ul className="flex flex-col list-none m-0 p-0 border-t border-white/[0.06]">
            {[
              { href: "/become-talent", label: "Become Talent" },
              { href: "/for-studios", label: "For Studios" },
              { href: "/auctions", label: "Auctions" },
              { href: "/about", label: "About" },
            ].map((l) => (
              <li key={l.href} className="border-b border-white/[0.06]">
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block font-condensed text-[15px] font-semibold uppercase tracking-[2.5px] text-warm-white px-6 py-5 no-underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 p-6 mt-auto">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block text-center font-condensed text-[14px] font-bold uppercase tracking-[2px] text-silver border border-white/20 px-5 py-3 no-underline"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="block text-center font-condensed text-[14px] font-bold uppercase tracking-[2px] text-warm-white bg-orange px-6 py-3 no-underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
