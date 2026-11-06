// app/(dashboard)/referrals/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_CASES_DB } from "@/lib/referral-service";
import { CaseRecord, DerivedCaseStatus, computeDerivedStatus } from "@/types/referral";
import { StatusBadge } from "@/components/application/referrals/status-badge";

type FilterTab =
  | "All"
  | "Needs Action"
  | "Awaiting Validation"
  | "Duplicate Flagged"
  | "Recommendations Ready"
  | "On Hold";

export default function CasesDirectoryPage() {
  const [cases] = useState<CaseRecord[]>(MOCK_CASES_DB);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("Needs Action");
  const [sourceFilter, setSourceFilter] = useState("All");

  // Summary Metrics
  const metrics = useMemo(() => {
    return {
      total: cases.length,
      awaitingValidation: cases.filter((c) => computeDerivedStatus(c) === "Awaiting Validation").length,
      duplicates: cases.filter((c) => computeDerivedStatus(c) === "Duplicate Flagged").length,
      matchingReady: cases.filter((c) => computeDerivedStatus(c) === "Recommendations Ready").length,
    };
  }, [cases]);

  // Filter Logic
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const derived = computeDerivedStatus(c);

      let matchesTab = true;
      if (activeTab === "Needs Action") {
        matchesTab =
          derived === "Awaiting Validation" ||
          derived === "Duplicate Flagged" ||
          derived === "Needs Correction" ||
          derived === "Recommendations Ready";
      } else if (activeTab !== "All") {
        matchesTab = derived === activeTab;
      }

      const q = searchQuery.toLowerCase().trim();
      const patient = c.draftProfile.patientName.value.toLowerCase();
      const matchesSearch =
        q === "" ||
        c.id.toLowerCase().includes(q) ||
        patient.includes(q) ||
        c.referralSource.toLowerCase().includes(q);

      const matchesSource = sourceFilter === "All" || c.referralSource === sourceFilter;

      return matchesTab && matchesSearch && matchesSource;
    });
  }, [cases, activeTab, searchQuery, sourceFilter]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10 font-['Clash_Grotesk'] text-[#101828]">
        
        {/* Header with High-Contrast Primaries */}
        <div className="flex flex-col justify-between gap-4 py-1 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[32px] font-[500] leading-tight text-[#101828]">Cases &amp; Referrals</h1>
            <p className="mt-1 text-[14px] text-[#475467]">
              Intake queue, document extraction, human validation checkpoint, and caregiver placement.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/referrals/bulk"
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#eaecf0] bg-white px-3.5 py-2.5 text-[14px] font-[500] text-[#344054] shadow-xs hover:bg-[#F8FAFC] transition-colors"
            >
              <svg className="h-4 w-4 text-[#667085]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Bulk Upload
            </Link>
            <Link
              href="/referrals/new"
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#eaecf0] bg-white px-3.5 py-2.5 text-[14px] font-[500] text-[#344054] shadow-xs hover:bg-[#F8FAFC] transition-colors"
            >
              <span className="text-[#007aff] font-semibold text-[16px] leading-none">+</span>
              <span>New Referral Intake</span>
            </Link>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#667085] uppercase tracking-wider block">Total Active Cases</span>
            <span className="text-[28px] font-[500] text-[#101828] mt-1 block">{metrics.total}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#007AFF] uppercase tracking-wider block">Needs Validation</span>
            <span className="text-[28px] font-[500] text-[#007AFF] mt-1 block">{metrics.awaitingValidation}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#B26A00] uppercase tracking-wider block">Duplicate Flags</span>
            <span className="text-[28px] font-[500] text-[#B26A00] mt-1 block">{metrics.duplicates}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#1E7E34] uppercase tracking-wider block">Placement Ready</span>
            <span className="text-[28px] font-[500] text-[#1E7E34] mt-1 block">{metrics.matchingReady}</span>
          </div>
        </div>

        {/* Tabs with Logical Action Grouping */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#D0D5DD] pb-2 text-[14px]">
          {(
            [
              "Needs Action",
              "Awaiting Validation",
              "Duplicate Flagged",
              "Recommendations Ready",
              "On Hold",
              "All",
            ] as FilterTab[]
          ).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-[6px] px-3.5 py-1.5 transition-colors text-[14px] ${
                activeTab === tab
                  ? "bg-[#007AFF]/10 text-[#007AFF] font-[500]"
                  : "text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828] font-[400]"
              }`}
            >
              {tab}
              {tab === "Needs Action" && (
                <span className="ml-1.5 rounded-full bg-[#007AFF] px-1.5 py-0.2 text-[11px] text-white">
                  {metrics.awaitingValidation + metrics.duplicates + metrics.matchingReady}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Provider Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by patient, case ID, or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[8px] border border-[#D0D5DD] bg-white px-3.5 py-2 pl-9 text-[14px] text-[#101828] shadow-xs focus:border-[#007AFF] focus:outline-none"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-[#98A2B3]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#667085]">Source Channel:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-[8px] border border-[#D0D5DD] bg-white px-3 py-2 text-[14px] text-[#344054] shadow-xs focus:outline-none"
            >
              <option value="All">All Sources</option>
              <option value="St. Jude Vascular Care">St. Jude Vascular Care</option>
              <option value="Metropolitan Surgical Group">Metropolitan Surgical Group</option>
              <option value="Pine Valley Rehab">Pine Valley Rehab</option>
            </select>
          </div>
        </div>

        {/* Main Cases Table */}
        <div className="overflow-hidden rounded-[8px] border border-[#D0D5DD] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-[#D0D5DD] bg-[#F8FAFC] text-[12px] text-[#667085]">
                  <th className="py-3 px-4 font-[500]">Case Reference</th>
                  <th className="py-3 px-4 font-[500]">Patient Information</th>
                  <th className="py-3 px-4 font-[500]">Care Discipline Required</th>
                  <th className="py-3 px-4 font-[500]">Territory</th>
                  <th className="py-3 px-4 font-[500]">Date Received</th>
                  <th className="py-3 px-4 font-[500]">Workflow Status</th>
                  <th className="py-3 px-4 font-[500] text-right">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D0D5DD]">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <p className="text-[14px] font-medium text-[#101828]">No referral records found</p>
                      <p className="text-[12px] text-[#667085] mt-1">Try clearing your search query or switching tabs.</p>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="mt-3 rounded-[6px] border border-[#D0D5DD] bg-white px-3 py-1.5 text-[12px] font-medium text-[#344054] hover:bg-[#F8FAFC]"
                        >
                          Clear Search Filter
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((c) => {
                    const derived = computeDerivedStatus(c);
                    const isActionable =
                      derived === "Awaiting Validation" ||
                      derived === "Duplicate Flagged" ||
                      derived === "Needs Correction";

                    const dobValue =
                      c.draftProfile.dob?.value ||
                      c.draftProfile.dateOfBirth?.value ||
                      "N/A";

                    return (
                      <tr key={c.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-[#101828]">
                          <Link href={`/referrals/${c.id}`} className="hover:text-[#007AFF]">
                            {c.id}
                          </Link>
                          <div className="text-[11px] font-normal text-[#667085]">{c.referralSource}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#101828]">{c.draftProfile.patientName.value}</div>
                          <div className="text-[12px] text-[#667085]">DOB: {dobValue}</div>
                        </td>

                        <td className="py-3.5 px-4 text-[#344054]">
                          {c.draftProfile.careDisciplineRequired.value}
                          <span className="text-[12px] text-[#667085] block">
                            {c.draftProfile.authorizedHoursPerWeek.value} hrs/week
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[12px] text-[#667085]">
                          {c.draftProfile.zipCode.value || <span className="text-[#FF9500]">Pending</span>}
                        </td>

                        <td className="py-3.5 px-4 text-[#667085]">
                          {c.dateReceived}
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge status={derived} size="sm" />
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={isActionable ? `/referrals/${c.id}/validate` : `/referrals/${c.id}`}
                            className="rounded-[6px] border border-[#eaecf0] bg-white px-3 py-1 text-[12px] font-[500] text-[#344054] hover:bg-[#F8FAFC] transition-colors shadow-2xs"
                          >
                            {derived === "Awaiting Validation" && "Validate \u2192"}
                            {derived === "Duplicate Flagged" && "Resolve Match \u2192"}
                            {derived === "Needs Correction" && "Correct \u2192"}
                            {derived === "Recommendations Ready" && "Review Matches \u2192"}
                            {derived === "Approved" && "View Details"}
                            {derived === "On Hold" && "Review Hold"}
                            {derived === "Processing" && "View"}
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}