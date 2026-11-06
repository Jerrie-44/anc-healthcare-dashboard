// app/(dashboard)/caregivers/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_CAREGIVERS_DB } from "@/lib/caregiver-service";
import { CaregiverRecord, computeMatchingEligibility } from "@/types/caregiver";

type DirectoryTab = "All" | "Eligible Roster" | "Pending Review" | "Compliance Alerts" | "Availability Outdated";

export default function CaregiverDirectoryPage() {
  const [caregivers] = useState<CaregiverRecord[]>(MOCK_CAREGIVERS_DB);
  const [activeTab, setActiveTab] = useState<DirectoryTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("All");

  const metrics = useMemo(() => {
    return {
      total: caregivers.length,
      eligible: caregivers.filter((c) => computeMatchingEligibility(c) === "Eligible").length,
      pendingReview: caregivers.filter((c) => c.approvalStatus === "Pending Human Review").length,
      complianceIssues: caregivers.filter((c) => c.complianceStatus === "Issues Identified" || c.complianceStatus === "Expired").length,
    };
  }, [caregivers]);

  const filtered = useMemo(() => {
    return caregivers.filter((cg) => {
      const eligibility = computeMatchingEligibility(cg);
      
      let matchesTab = true;
      if (activeTab === "Eligible Roster") matchesTab = eligibility === "Eligible";
      else if (activeTab === "Pending Review") matchesTab = cg.approvalStatus === "Pending Human Review";
      else if (activeTab === "Compliance Alerts") matchesTab = cg.complianceStatus === "Issues Identified" || cg.complianceStatus === "Expired";

      const q = searchQuery.toLowerCase().trim();
      const name = cg.personal.fullName.value.toLowerCase();
      const matchesSearch = q === "" || cg.id.toLowerCase().includes(q) || name.includes(q);

      const matchesDiscipline =
        disciplineFilter === "All" || cg.professional.primaryDiscipline.value.includes(disciplineFilter);

      return matchesTab && matchesSearch && matchesDiscipline;
    });
  }, [caregivers, activeTab, searchQuery, disciplineFilter]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-['Clash_Grotesk'] text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
        
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 py-1 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[32px] font-[500] leading-tight text-[#101828]">Caregivers &amp; Clinicians</h1>
            <p className="mt-1 text-[14px] text-[#667085]">
              Talent pool management, human credentialing checkpoints, screening audits, and live availability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/caregivers/review-queue"
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#eaecf0] bg-white px-3.5 py-2.5 text-[14px] font-[500] text-[#344054] shadow-xs hover:bg-[#F8FAFC] transition-colors"
            >
              Review Queue ({metrics.pendingReview})
            </Link>
            <Link
              href="/caregivers/voice-screening"
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#eaecf0] bg-white px-3.5 py-2.5 text-[14px] font-[500] text-[#344054] shadow-xs hover:bg-[#F8FAFC] transition-colors"
            >
              Voice Screening Sessions
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#667085] uppercase tracking-wider block">Total Roster</span>
            <span className="text-[28px] font-[500] text-[#101828] mt-1 block">{metrics.total}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#1E7E34] uppercase tracking-wider block">Eligible for Matching</span>
            <span className="text-[28px] font-[500] text-[#1E7E34] mt-1 block">{metrics.eligible}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#007AFF] uppercase tracking-wider block">Pending Human Review</span>
            <span className="text-[28px] font-[500] text-[#007AFF] mt-1 block">{metrics.pendingReview}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#B26A00] uppercase tracking-wider block">Compliance Actions</span>
            <span className="text-[28px] font-[500] text-[#B26A00] mt-1 block">{metrics.complianceIssues}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#D0D5DD] pb-2 text-[14px]">
          {(["All", "Eligible Roster", "Pending Review", "Compliance Alerts"] as DirectoryTab[]).map((tab) => (
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
            </button>
          ))}
        </div>

        {/* Search & Discipline Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by clinician name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[8px] border border-[#D0D5DD] bg-white px-3.5 py-2 pl-9 text-[14px] text-[#101828] shadow-xs focus:border-[#007AFF] focus:outline-none"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-[#98A2B3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#667085]">Discipline:</span>
            <select
              value={disciplineFilter}
              onChange={(e) => setDisciplineFilter(e.target.value)}
              className="rounded-[8px] border border-[#D0D5DD] bg-white px-3 py-2 text-[14px] text-[#344054] shadow-xs focus:outline-none"
            >
              <option value="All">All Disciplines</option>
              <option value="RN">RN (Registered Nurse)</option>
              <option value="PT">PT (Physical Therapist)</option>
              <option value="HHA">HHA (Home Health Aide)</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-hidden rounded-[8px] border border-[#D0D5DD] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-[#D0D5DD] bg-[#F8FAFC] text-[12px] text-[#667085]">
                  <th className="py-3 px-4 font-[500]">Caregiver</th>
                  <th className="py-3 px-4 font-[500]">Discipline &amp; Experience</th>
                  <th className="py-3 px-4 font-[500]">Territory</th>
                  <th className="py-3 px-4 font-[500]">Caseload Capacity</th>
                  <th className="py-3 px-4 font-[500]">Credentialing</th>
                  <th className="py-3 px-4 font-[500]">Human Approval</th>
                  <th className="py-3 px-4 font-[500]">Matching Eligibility</th>
                  <th className="py-3 px-4 font-[500] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D0D5DD]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#667085]">
                      No caregivers found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((cg) => {
                    const eligibility = computeMatchingEligibility(cg);
                    return (
                      <tr key={cg.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <Link href={`/caregivers/${cg.id}`} className="font-medium text-[#101828] hover:text-[#007AFF]">
                            {cg.personal.fullName.value}
                          </Link>
                          <div className="font-mono text-[11px] text-[#667085]">{cg.id}</div>
                        </td>

                        <td className="py-3.5 px-4 text-[#344054]">
                          {cg.professional.primaryDiscipline.value}
                          <div className="text-[12px] text-[#667085]">
                            {cg.professional.yearsExperience.value} yrs direct care
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#667085] font-mono text-[12px]">
                          {cg.personal.city.value}, {cg.personal.zipCode.value}
                        </td>

                        <td className="py-3.5 px-4 text-[#344054]">
                          {cg.placements.activeCasesCount} / {cg.placements.maxCaseloadCapacity} active
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            cg.credentialingStatus === "Complete" ? "bg-[#34C759]/15 text-[#1E7E34]" : "bg-[#FF9500]/15 text-[#B26A00]"
                          }`}>
                            {cg.credentialingStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            cg.approvalStatus === "Approved" ? "bg-[#34C759]/15 text-[#1E7E34]" : "bg-[#007AFF]/10 text-[#007AFF]"
                          }`}>
                            {cg.approvalStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            eligibility === "Eligible" ? "bg-[#34C759]/15 text-[#1E7E34]" : "bg-[#F2F4F7] text-[#667085]"
                          }`}>
                            {eligibility}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/caregivers/${cg.id}`}
                            className="rounded-[6px] border border-[#eaecf0] bg-white px-3 py-1 text-[12px] font-[500] text-[#344054] hover:bg-[#F8FAFC] transition-colors shadow-2xs"
                          >
                            Inspect Profile &rarr;
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