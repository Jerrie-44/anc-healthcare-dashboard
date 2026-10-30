// components/application/navigation/navbar.tsx
"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// 1. Internal component containing the pathname hook
function NavbarContent() {
  const pathname = usePathname();

  // Hide the navbar on the login screen
  if (pathname === "/login") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#eaecf0] bg-white">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-6 lg:px-10">
        
        {/* Brand / Logo */}
        <Link href="/referrals" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#007aff] text-white font-bold text-sm shadow-xs">
            +
          </div>
          <span className="text-body-medium font-bold text-text-primary tracking-tight">
            Advanced Nursing Care
          </span>
        </Link>

        {/* Primary Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/referrals"
            className={`rounded-[8px] px-3 py-1.5 text-body-2-medium transition ${
              pathname.startsWith("/referrals")
                ? "bg-[#007aff]/10 text-[#007aff]"
                : "text-text-secondary hover:bg-slate-50 hover:text-text-primary"
            }`}
          >
            Referrals &amp; Triage
          </Link>
          <Link
            href="/clinicians"
            className={`rounded-[8px] px-3 py-1.5 text-body-2-medium transition ${
              pathname.startsWith("/clinicians")
                ? "bg-[#007aff]/10 text-[#007aff]"
                : "text-text-secondary hover:bg-slate-50 hover:text-text-primary"
            }`}
          >
            Clinician Roster
          </Link>
          <Link
            href="/schedule"
            className={`rounded-[8px] px-3 py-1.5 text-body-2-medium transition ${
              pathname.startsWith("/schedule")
                ? "bg-[#007aff]/10 text-[#007aff]"
                : "text-text-secondary hover:bg-slate-50 hover:text-text-primary"
            }`}
          >
            Care Schedule
          </Link>
          <Link
            href="/analytics"
            className={`rounded-[8px] px-3 py-1.5 text-body-2-medium transition ${
              pathname.startsWith("/analytics")
                ? "bg-[#007aff]/10 text-[#007aff]"
                : "text-text-secondary hover:bg-slate-50 hover:text-text-primary"
            }`}
          >
            Analytics
          </Link>
        </nav>

        {/* Right Status Indicator & User Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Triage Online
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-caption-1-bold text-[#007aff] border border-[#eaecf0]">
              DR
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-caption-1-medium font-semibold text-text-primary leading-tight">
                Dr. R. Sterling
              </span>
              <span className="text-[10px] text-text-tertiary">
                Lead Triage RN
              </span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}

// 2. Export wrapped in Suspense so Next.js static prerendering never throws CLIENT_HOOK_DYNAMIC
export function Navbar() {
  return (
    <Suspense fallback={<div className="h-16 w-full border-b border-[#eaecf0] bg-white" />}>
      <NavbarContent />
    </Suspense>
  );
}