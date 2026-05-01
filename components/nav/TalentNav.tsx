"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Profile = {
  full_name: string | null;
  email: string;
};

export function TalentNav({
  profile,
  unreadMessages = 0,
  unreadNotifications = 0,
}: {
  profile: Profile;
  unreadMessages?: number;
  unreadNotifications?: number;
}) {
  const [dropdown, setDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const displayName = profile.full_name ?? profile.email.split("@")[0];

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-6 md:px-12 h-[72px] bg-gradient-to-b from-dark/[0.98] to-transparent">
      <Link
        href="/talent/dashboard"
        className="font-display text-[24px] md:text-[28px] tracking-[3px] text-warm-white no-underline"
      >
        TALEN<span className="text-orange">T</span>O
      </Link>

      {/* Desktop links */}
      <ul className="hidden md:flex gap-10 list-none m-0 p-0">
        <li>
          <Link
            href="/talent/dashboard"
            className="font-condensed text-[13px] font-semibold uppercase tracking-[2.5px] text-silver hover:text-warm-white transition-colors no-underline"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/talent/upload"
            className="font-condensed text-[13px] font-semibold uppercase tracking-[2.5px] text-silver hover:text-warm-white transition-colors no-underline"
          >
            Photos
          </Link>
        </li>
        <li>
          <Link
            href="/talent/invites"
            className="font-condensed text-[13px] font-semibold uppercase tracking-[2.5px] text-silver hover:text-warm-white transition-colors no-underline"
          >
            Invites
          </Link>
        </li>
        <li>
          <Link
            href="/talent/messages"
            className="font-condensed text-[13px] font-semibold uppercase tracking-[2.5px] text-silver hover:text-warm-white transition-colors no-underline inline-flex items-center gap-1.5"
          >
            Messages
            {unreadMessages > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-orange text-white text-[10px] font-bold">
                {unreadMessages}
              </span>
            )}
          </Link>
        </li>
      </ul>

      {/* Desktop account dropdown */}
      <div className="hidden md:flex items-center gap-3 relative" ref={ref}>
        <Link
          href="/talent/notifications"
          aria-label="Notifications"
          className="relative w-9 h-9 flex items-center justify-center border border-white/20 hover:border-orange transition-colors text-warm-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-orange text-white text-[9px] font-bold flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </Link>
        <button
          onClick={() => setDropdown((o) => !o)}
          className="flex items-center gap-2 font-condensed text-[12px] font-bold uppercase tracking-[2px] text-warm-white border border-white/20 hover:border-orange px-4 py-2 transition-colors"
        >
          <span className="w-5 h-5 bg-orange flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </span>
          {displayName}
          <span className="text-[8px] ml-1">{dropdown ? "▲" : "▼"}</span>
        </button>

        {dropdown && (
          <div className="absolute top-full right-0 mt-1 w-44 bg-dark-3 border border-white/10 z-50">
            <Link
              href="/talent/dashboard"
              onClick={() => setDropdown(false)}
              className="block font-condensed text-[11px] font-semibold uppercase tracking-[1.5px] text-silver hover:text-warm-white hover:bg-mid px-4 py-3 transition-colors no-underline"
            >
              Dashboard
            </Link>
            <Link
              href="/talent/settings/profile"
              onClick={() => setDropdown(false)}
              className="block font-condensed text-[11px] font-semibold uppercase tracking-[1.5px] text-silver hover:text-warm-white hover:bg-mid px-4 py-3 transition-colors no-underline"
            >
              Edit Profile
            </Link>
            <Link
              href="/talent/settings/account"
              onClick={() => setDropdown(false)}
              className="block font-condensed text-[11px] font-semibold uppercase tracking-[1.5px] text-silver hover:text-warm-white hover:bg-mid px-4 py-3 transition-colors no-underline"
            >
              Account & Password
            </Link>
            <Link
              href="/talent/settings/blocked"
              onClick={() => setDropdown(false)}
              className="block font-condensed text-[11px] font-semibold uppercase tracking-[1.5px] text-silver hover:text-warm-white hover:bg-mid px-4 py-3 transition-colors no-underline"
            >
              Blocked Accounts
            </Link>
            <div className="border-t border-white/10" />
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full text-left font-condensed text-[11px] font-semibold uppercase tracking-[1.5px] text-grey hover:text-orange hover:bg-mid px-4 py-3 transition-colors"
              >
                Log Out
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile burger */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        className="md:hidden flex flex-col justify-center gap-[5px] w-6 h-10 z-[101]"
      >
        <span
          className={`block w-6 h-[2px] bg-warm-white transition-transform ${
            mobileOpen ? "translate-y-[7px] rotate-45" : ""
          }`}
        />
        <span
          className={`block w-6 h-[2px] bg-orange transition-opacity ${
            mobileOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block w-6 h-[2px] bg-warm-white transition-transform ${
            mobileOpen ? "-translate-y-[7px] -rotate-45" : ""
          }`}
        />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[72px] bg-dark z-[99] flex flex-col">
          <div className="flex items-center gap-3 px-6 py-5 border-t border-b border-white/[0.06]">
            <span className="w-9 h-9 bg-orange flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="font-condensed text-[13px] font-bold uppercase tracking-[2px] text-warm-white truncate">
                {displayName}
              </div>
              <div className="font-body text-[12px] text-grey truncate">
                {profile.email}
              </div>
            </div>
          </div>
          <ul className="flex flex-col list-none m-0 p-0">
            {[
              { href: "/talent/dashboard", label: "Dashboard" },
              { href: "/talent/upload", label: "Photos" },
              { href: "/talent/invites", label: "Invites" },
              { href: "/talent/messages", label: "Messages" },
              { href: "/talent/notifications", label: "Notifications" },
              { href: "/talent/settings/profile", label: "Edit Profile" },
              { href: "/talent/settings/account", label: "Account & Password" },
              { href: "/talent/settings/blocked", label: "Blocked Accounts" },
            ].map((l) => (
              <li key={l.href} className="border-b border-white/[0.06]">
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block font-condensed text-[15px] font-semibold uppercase tracking-[2.5px] text-warm-white px-6 py-5 no-underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <form action="/auth/logout" method="POST" className="mt-auto p-6">
            <button
              type="submit"
              className="w-full font-condensed text-[14px] font-bold uppercase tracking-[2px] text-orange border border-orange/40 px-5 py-3"
            >
              Log Out
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}
