// components/application/navigation/navbar.tsx
"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

function NavbarContent() {
  const pathname = usePathname();
  const [isCaregiversMenuOpen, setIsCaregiversMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCaregiversMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsCaregiversMenuOpen(false);
  }, [pathname]);

  if (pathname === "/login" || pathname.startsWith("/screening/")) {
    return null;
  }

  const isCaregiversActive =
    pathname.startsWith("/clinicians") || pathname.startsWith("/caregivers");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#eaecf0] bg-white font-['Clash_Grotesk']">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-6 lg:px-10">
        
        {/* Brand / Logo */}
        <Link href="/referrals" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#007aff] text-white font-medium text-[16px]">
            +
          </div>
          <span className="text-[16px] font-[500] text-[#101828] tracking-tight">
            Advanced Nursing Care
          </span>
        </Link>

        {/* Primary Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/referrals"
            className={`rounded-[8px] px-3 py-1.5 text-[14px] font-[400] transition-colors ${
              pathname.startsWith("/referrals")
                ? "bg-[#007aff]/10 text-[#007aff] font-[500]"
                : "text-[#344054] hover:bg-[#f2f4f7] hover:text-[#101828]"
            }`}
          >
            Cases &amp; Referrals
          </Link>

          {/* Care givers Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsCaregiversMenuOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1 rounded-[8px] px-3 py-1.5 text-[14px] font-[400] transition-colors ${
                isCaregiversActive
                  ? "bg-[#007aff]/10 text-[#007aff] font-[500]"
                  : "text-[#344054] hover:bg-[#f2f4f7] hover:text-[#101828]"
              }`}
            >
              <span>Care givers</span>
              <svg
                className={`h-4 w-4 text-[#667085] transition-transform duration-200 ${
                  isCaregiversMenuOpen ? "rotate-180 text-[#007aff]" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isCaregiversMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-60 rounded-[8px] border border-[#eaecf0] bg-white p-1.5 shadow-lg z-50">
                <Link
                  href="/clinicians"
                  className={`block rounded-[6px] px-3 py-2 text-[14px] transition-colors ${
                    pathname === "/clinicians"
                      ? "bg-[#007aff]/10 text-[#007aff] font-[500]"
                      : "text-[#344054] hover:bg-[#f2f4f7] hover:text-[#101828]"
                  }`}
                >
                  All Candidates &amp; Roster
                </Link>
                <Link
                  href="/caregivers/voice-screening"
                  className={`block rounded-[6px] px-3 py-2 text-[14px] transition-colors ${
                    pathname.startsWith("/caregivers/voice-screening")
                      ? "bg-[#007aff]/10 text-[#007aff] font-[500]"
                      : "text-[#344054] hover:bg-[#f2f4f7] hover:text-[#101828]"
                  }`}
                >
                  Voice Screening Sessions
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/schedule"
            className={`rounded-[8px] px-3 py-1.5 text-[14px] font-[400] transition-colors ${
              pathname.startsWith("/schedule")
                ? "bg-[#007aff]/10 text-[#007aff] font-[500]"
                : "text-[#344054] hover:bg-[#f2f4f7] hover:text-[#101828]"
            }`}
          >
            Placements &amp; Schedule
          </Link>
          <Link
            href="/analytics"
            className={`rounded-[8px] px-3 py-1.5 text-[14px] font-[400] transition-colors ${
              pathname.startsWith("/analytics")
                ? "bg-[#007aff]/10 text-[#007aff] font-[500]"
                : "text-[#344054] hover:bg-[#f2f4f7] hover:text-[#101828]"
            }`}
          >
            Analytics
          </Link>
        </nav>

        {/* User Identity */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f4f7] text-[12px] font-medium text-[#007aff] border border-[#eaecf0]">
            DR
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-[14px] font-[500] text-[#101828] leading-tight">
              Dr. R. Sterling
            </span>
            <span className="text-[12px] text-[#667085]">
              Lead Clinical Dispatcher
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}

export function Navbar() {
  return (
    <Suspense fallback={<div className="h-16 w-full border-b border-[#eaecf0] bg-white font-['Clash_Grotesk']" />}>
      <NavbarContent />
    </Suspense>
  );
}