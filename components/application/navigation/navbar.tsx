// components/application/navigation/navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Referrals & Triage", href: "/referrals" },
  { label: "Clinician Roster", href: "/clinicians" },
  { label: "Care Schedule", href: "/schedule" },
  { label: "Analytics", href: "/analytics" },
];

export function Navbar() {
  const pathname = usePathname();

  // Hide the navbar on the login screen
  if (pathname === "/login") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#eaecf0] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center justify-between px-6 lg:px-10">
        
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/referrals" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#007aff] text-white shadow-xs">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-body-1-semibold font-bold tracking-tight text-text-primary">
                Advanced Nursing Care
              </span>
            
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/referrals"
                  ? pathname.startsWith("/referrals")
                  : pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[10px] px-3.5 py-1.5 text-body-2-medium transition ${
                    isActive
                      ? "bg-slate-100/80 font-semibold text-[#007aff]"
                      : "text-text-secondary hover:bg-slate-50 hover:text-text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: System Status & User Profile */}
        <div className="flex items-center gap-3">
          {/* Real-time Triage Status Pill */}
          <div className="hidden items-center gap-2 rounded-[10px] border border-[#eaecf0] bg-[#f8fafc] px-3 py-1.5 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-caption-1-medium text-text-secondary">
              AI Triage Online
            </span>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2.5 border-l border-[#eaecf0] pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-caption-1-bold text-[#007aff]">
              DR
            </div>
            <div className="hidden flex-col text-left sm:flex">
              <span className="text-caption-1-bold leading-tight text-text-primary">
                Dr. R. Sterling
              </span>
              <span className="text-[11px] leading-tight text-text-tertiary">
                Lead Triage RN
              </span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}