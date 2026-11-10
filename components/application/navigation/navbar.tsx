// components/application/navigation/navbar.tsx
"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { 
    label: "Cases Intake", 
    href: "/cases-intake",
    matchRoutes: ["/cases-intake", "/referrals", "/care-requirements"] 
  },
  { 
    label: "Care Givers", 
    href: "/care-givers",
    matchRoutes: ["/care-givers", "/caregivers", "/talent-database", "/clinicians"] 
  },
];

function NavbarContent() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname.startsWith("/screening/")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D0D5DD] bg-white">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-6 lg:px-10">
        
        {/* Brand */}
        <Link href="/cases-intake" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#007AFF] text-white font-medium text-[16px] shadow-xs">
            +
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-[500] text-[#101828] tracking-tight">
              ANC Healthcare
            </span>
            <span className="rounded bg-[#F2F4F7] px-2 py-0.5 text-[11px] font-medium text-[#667085]">
              Intake &amp; Match
            </span>
          </div>
        </Link>

        {/* 2 Primary Pillars Only */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.matchRoutes.some((route) => 
              pathname === route || pathname.startsWith(`${route}/`)
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[8px] px-4 py-2 text-[14px] transition-colors ${
                  isActive
                    ? "bg-[#007AFF]/10 text-[#007AFF] font-[500]"
                    : "text-[#344054] hover:bg-[#F2F4F7] hover:text-[#101828] font-[400]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Integrated Match Engine Status Indicator & User Profile */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#34C759]/10 px-2.5 py-1 text-[12px] font-medium text-[#34C759]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34C759] animate-pulse" />
            Match Engine Automated
          </span>

          <div className="flex items-center gap-2 pl-2 border-l border-[#EAECF0]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F4F7] text-[12px] font-medium text-[#007AFF] border border-[#EAECF0]">
              OP
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-[13px] font-[500] text-[#101828] leading-tight">
                Human Reviewer
              </span>
              <span className="text-[11px] text-[#667085]">
                Validation Dispatch
              </span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}

export function Navbar() {
  return (
    <Suspense fallback={<div className="h-16 w-full border-b border-[#D0D5DD] bg-white" />}>
      <NavbarContent />
    </Suspense>
  );
}