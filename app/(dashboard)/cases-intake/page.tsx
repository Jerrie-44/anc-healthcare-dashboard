// app/(dashboard)/cases-intake/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { CaseIntakeRecord } from "@/types/cases-intake";
import { getStoredCases, popRecentlyValidatedIds } from "@/lib/cases-store";
import { CaseDetailsDrawer } from "@/components/application/cases-intake/case-details-drawer";

export default function CasesOverviewPage() {
  const [cases, setCases] = useState<CaseIntakeRecord[]>([]);
  const [recentlyValidatedIds, setRecentlyValidatedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedCase, setSelectedCase] = useState<CaseIntakeRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // Read persisted store
    const stored = getStoredCases();
    setCases(stored);

    // Retrieve and flash highlight newly validated records
    const recent = popRecentlyValidatedIds();
    if (recent.length > 0) {
      setRecentlyValidatedIds(recent);
      const timer = setTimeout(() => {
        setRecentlyValidatedIds([]);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchedName =
        c.status === "Validated"
          ? c.validationDecision?.selectedCaregiverName || ""
          : c.matchResults?.shortlist?.[0]?.name || "";

      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.disciplineNeeded.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.zipCode.includes(searchQuery) ||
        matchedName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cases, searchQuery, statusFilter]);

  const openCaseDetails = (c: CaseIntakeRecord) => {
    setSelectedCase(c);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10 font-sans text-[#101828]">
        
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#EAECF0] pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-[#101828]">
              Cases
            </h1>
            <p className="mt-1 text-[14px] text-[#475467]">
              View and manage patient care cases and their caregiver assignments.
            </p>
          </div>

          <Link
            href="/cases-intake/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#007AFF] px-4 py-2.5 text-[14px] font-medium text-white shadow-xs hover:bg-[#0062CC] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Upload Referral</span>
          </Link>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by case ID, patient name, discipline, or caregiver..."
              className="w-full rounded-lg border border-[#D0D5DD] bg-white py-2 pl-10 pr-4 text-[14px] text-[#101828] placeholder-[#667085] shadow-xs focus:border-[#007AFF] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[13px]">
            {["All", "Pending Review", "Validated", "Needs Information", "Unmatched"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3 py-1 transition-colors ${
                  statusFilter === status
                    ? "bg-[#101828] text-white font-medium shadow-xs"
                    : "bg-white text-[#667085] border border-[#EAECF0] hover:bg-[#F2F4F7]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Cases Table */}
        <div className="rounded-xl border border-[#EAECF0] bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[14px]">
              <thead className="border-b border-[#EAECF0] bg-[#F8FAFC] text-[12px] uppercase font-semibold text-[#667085]">
                <tr>
                  <th className="py-3 px-5">Case ID</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Care Requirement</th>
                  <th className="py-3 px-4">Assigned Caregiver</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Matching Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#667085]">
                      No care cases found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((c) => {
                    const topMatch = c.matchResults?.shortlist?.[0];
                    const isRecentlyUpdated = recentlyValidatedIds.includes(c.id);

                    return (
                      <tr
                        key={c.id}
                        onClick={() => openCaseDetails(c)}
                        className={`cursor-pointer transition-colors duration-700 ${
                          isRecentlyUpdated
                            ? "bg-[#34C759]/15"
                            : "hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <td className="py-3.5 px-5 font-mono text-[13px] font-semibold text-[#101828]">
                          {c.id}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#101828]">
                          {c.patientName}
                        </td>
                        <td className="py-3.5 px-4 text-[#344054]">
                          <span>{c.disciplineNeeded || "—"}</span>
                          <span className="text-[12px] text-[#667085] block">
                            {c.hoursPerWeek} hrs/wk
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {c.status === "Validated" && c.validationDecision ? (
                            <div>
                              <span className="font-semibold text-[#101828] flex items-center gap-1.5">
                                <span className="text-[#34C759]">✓</span>
                                {c.validationDecision.selectedCaregiverName}
                              </span>
                              <span className="text-[11px] text-[#34C759] font-medium">Human Validated</span>
                            </div>
                          ) : topMatch ? (
                            <div>
                              <span className="font-medium text-[#101828]">{topMatch.name}</span>
                              <span className="text-[11px] text-[#007AFF] block">
                                Recommended ({topMatch.overallScore}% score)
                              </span>
                            </div>
                          ) : c.status === "Needs Information" ? (
                            <span className="text-[13px] text-[#FF3B30]">Missing Details</span>
                          ) : (
                            <span className="text-[13px] text-[#667085]">None identified</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[13px] text-[#344054]">
                          {c.zipCode ? `ZIP ${c.zipCode}` : <span className="text-[#FF3B30] font-sans font-medium">Missing</span>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              c.status === "Pending Review"
                                ? "bg-[#007AFF]/10 text-[#007AFF]"
                                : c.status === "Validated"
                                ? "bg-[#34C759]/15 text-[#248A3D]"
                                : c.status === "Needs Information"
                                ? "bg-[#FF3B30]/10 text-[#FF3B30]"
                                : c.status === "Unmatched"
                                ? "bg-[#F79009]/15 text-[#B26A00]"
                                : "bg-[#F2F4F7] text-[#475467]"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCaseDetails(c);
                            }}
                            className="rounded-md px-2.5 py-1 text-[13px] font-medium text-[#007AFF] hover:bg-[#007AFF]/10 transition-colors"
                          >
                            View Case &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Case Details Drawer */}
        <CaseDetailsDrawer
          isOpen={isDrawerOpen}
          caseRecord={selectedCase}
          onClose={() => setIsDrawerOpen(false)}
          onValidate={() => {}}
          onReject={() => {}}
          onCorrect={() => {}}
        />

      </main>
    </div>
  );
}