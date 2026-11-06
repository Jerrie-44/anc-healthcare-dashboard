// app/(dashboard)/placements/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_PLACEMENTS_DB } from "@/lib/placement-service";
import { PlacementRecord, PlacementLifecycleStatus } from "@/types/placement";

type TabFilter =
  | "All Placements"
  | "Awaiting Contact"
  | "Pending Response"
  | "Coordination Required"
  | "Active"
  | "Issues & Exceptions"
  | "Completed";

export default function PlacementsOverviewPage() {
  const [placements] = useState<PlacementRecord[]>(MOCK_PLACEMENTS_DB);
  const [activeTab, setActiveTab] = useState<TabFilter>("All Placements");
  const [searchQuery, setSearchQuery] = useState("");

  const metrics = useMemo(() => {
    return {
      total: placements.length,
      awaitingContact: placements.filter(
        (p) => p.lifecycleStatus === "Created" && p.caregiverResponseStatus === "Not Contacted"
      ).length,
      coordination: placements.filter(
        (p) => p.lifecycleStatus === "Preparing" || (p.caregiverResponseStatus === "Accepted" && p.lifecycleStatus !== "Active")
      ).length,
      active: placements.filter((p) => p.lifecycleStatus === "Active").length,
      issues: placements.filter((p) => p.issues.some((i) => i.status === "Open")).length,
    };
  }, [placements]);

  const filtered = useMemo(() => {
    return placements.filter((p) => {
      let matchesTab = true;
      if (activeTab === "Awaiting Contact") {
        matchesTab = p.caregiverResponseStatus === "Not Contacted";
      } else if (activeTab === "Pending Response") {
        matchesTab = p.caregiverResponseStatus === "Contact Pending";
      } else if (activeTab === "Coordination Required") {
        matchesTab = p.caregiverResponseStatus === "Accepted" && p.lifecycleStatus !== "Active";
      } else if (activeTab === "Active") {
        matchesTab = p.lifecycleStatus === "Active";
      } else if (activeTab === "Issues & Exceptions") {
        matchesTab = p.issues.length > 0 || p.caregiverResponseStatus === "Declined" || p.caregiverResponseStatus === "Unreachable";
      } else if (activeTab === "Completed") {
        matchesTab = p.lifecycleStatus === "Completed";
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        p.id.toLowerCase().includes(q) ||
        p.patientName.toLowerCase().includes(q) ||
        p.caregiverName.toLowerCase().includes(q) ||
        p.caseId.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [placements, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-['Clash_Grotesk'] text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
        
        {/* Header Block */}
        <div className="flex flex-col justify-between gap-4 py-1 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[32px] font-[500] leading-tight text-[#101828]">Placement Management</h1>
            <p className="mt-1 text-[14px] text-[#667085]">
              Coordinate caregiver selections, manage assignment responses, coordinate onboarding, and monitor active patient care.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/referrals"
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#eaecf0] bg-white px-3.5 py-2.5 text-[14px] font-[500] text-[#344054] shadow-xs hover:bg-[#F8FAFC] transition-colors"
            >
              Cases Needing Placement &rarr;
            </Link>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#667085] uppercase tracking-wider block">Total Placements</span>
            <span className="text-[28px] font-[500] text-[#101828] mt-1 block">{metrics.total}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#007AFF] uppercase tracking-wider block">Awaiting Caregiver Contact</span>
            <span className="text-[28px] font-[500] text-[#007AFF] mt-1 block">{metrics.awaitingContact}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#B26A00] uppercase tracking-wider block">Coordination Required</span>
            <span className="text-[28px] font-[500] text-[#B26A00] mt-1 block">{metrics.coordination}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#1E7E34] uppercase tracking-wider block">Active In-Home Care</span>
            <span className="text-[28px] font-[500] text-[#1E7E34] mt-1 block">{metrics.active}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#D0D5DD] pb-2 text-[14px]">
          {(
            [
              "All Placements",
              "Awaiting Contact",
              "Pending Response",
              "Coordination Required",
              "Active",
              "Issues & Exceptions",
              "Completed",
            ] as TabFilter[]
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
              {tab === "Awaiting Contact" && metrics.awaitingContact > 0 && (
                <span className="ml-1.5 rounded-full bg-[#007AFF] px-1.5 py-0.2 text-[10px] text-white">
                  {metrics.awaitingContact}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-sm relative">
          <input
            type="text"
            placeholder="Search placement, patient, caregiver, or case..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[8px] border border-[#D0D5DD] bg-white px-3.5 py-2 pl-9 text-[14px] text-[#101828] shadow-xs focus:border-[#007AFF] focus:outline-none"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-[#98A2B3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Placements Table */}
        <div className="overflow-hidden rounded-[8px] border border-[#D0D5DD] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-[#D0D5DD] bg-[#F8FAFC] text-[12px] text-[#667085]">
                  <th className="py-3 px-4 font-[500]">Placement ID</th>
                  <th className="py-3 px-4 font-[500]">Patient &amp; Case</th>
                  <th className="py-3 px-4 font-[500]">Assigned Caregiver</th>
                  <th className="py-3 px-4 font-[500]">Discipline &amp; Hours</th>
                  <th className="py-3 px-4 font-[500]">Caregiver Response</th>
                  <th className="py-3 px-4 font-[500]">Coordination</th>
                  <th className="py-3 px-4 font-[500]">Lifecycle Status</th>
                  <th className="py-3 px-4 font-[500] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D0D5DD]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#667085]">
                      No placements found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((plc) => (
                    <tr key={plc.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-[#101828]">
                        <Link href={`/placements/${plc.id}`} className="hover:text-[#007AFF]">
                          {plc.id}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#101828]">{plc.patientName}</div>
                        <div className="font-mono text-[11px] text-[#667085]">{plc.caseId} &bull; {plc.patientZip}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#101828]">{plc.caregiverName}</div>
                        <div className="text-[11px] text-[#667085]">{plc.caregiverDiscipline} (Rank #{plc.caregiverMatchRank})</div>
                      </td>

                      <td className="py-3.5 px-4 text-[#344054]">
                        {plc.authorizedHoursPerWeek} hrs/week
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            plc.caregiverResponseStatus === "Accepted"
                              ? "bg-[#34C759]/15 text-[#1E7E34]"
                              : plc.caregiverResponseStatus === "Declined"
                              ? "bg-[#EF4444]/15 text-[#EF4444]"
                              : plc.caregiverResponseStatus === "Contact Pending"
                              ? "bg-[#FF9500]/15 text-[#B26A00]"
                              : "bg-[#007AFF]/10 text-[#007AFF]"
                          }`}
                        >
                          {plc.caregiverResponseStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[12px] text-[#344054] font-medium">
                          {plc.coordinationStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            plc.lifecycleStatus === "Active"
                              ? "bg-[#34C759]/15 text-[#1E7E34]"
                              : plc.lifecycleStatus === "Preparing"
                              ? "bg-[#007AFF]/10 text-[#007AFF]"
                              : plc.lifecycleStatus === "Completed"
                              ? "bg-[#F2F4F7] text-[#667085]"
                              : "bg-[#F8FAFC] border border-[#D0D5DD] text-[#344054]"
                          }`}
                        >
                          {plc.lifecycleStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/placements/${plc.id}`}
                          className="rounded-[6px] border border-[#eaecf0] bg-white px-3 py-1 text-[12px] font-[500] text-[#344054] hover:bg-[#F8FAFC] transition-colors shadow-2xs"
                        >
                          Open Workspace &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}