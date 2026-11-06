// app/(dashboard)/post-match/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_POST_MATCH_DB } from "@/lib/post-match-service";
import { PostMatchRecord } from "@/types/post-match";

type TabFilter =
  | "All Cases"
  | "Awaiting Review"
  | "Requirements Outstanding"
  | "Exceptions & Follow-ups"
  | "Ready for Placement";

export default function PostMatchProcessingOverviewPage() {
  const [records] = useState<PostMatchRecord[]>(MOCK_POST_MATCH_DB);
  const [activeTab, setActiveTab] = useState<TabFilter>("All Cases");
  const [searchQuery, setSearchQuery] = useState("");

  const metrics = useMemo(() => {
    return {
      total: records.length,
      awaitingReview: records.filter((r) => r.credentialingStatus === "Awaiting Review").length,
      outstandingReqs: records.filter((r) =>
        r.requirements.some((q) => q.status !== "Verified" && q.status !== "Not Applicable")
      ).length,
      exceptionsCount: records.filter((r) => r.exceptions.some((e) => e.status === "Open")).length,
      readyPlacement: records.filter((r) => r.readinessStatus === "Ready for Placement").length,
    };
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      let matchesTab = true;
      if (activeTab === "Awaiting Review") matchesTab = r.credentialingStatus === "Awaiting Review";
      else if (activeTab === "Requirements Outstanding") {
        matchesTab = r.requirements.some((q) => q.status !== "Verified" && q.status !== "Not Applicable");
      } else if (activeTab === "Exceptions & Follow-ups") {
        matchesTab = r.exceptions.length > 0;
      } else if (activeTab === "Ready for Placement") {
        matchesTab = r.readinessStatus === "Ready for Placement";
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        r.id.toLowerCase().includes(q) ||
        r.patientName.toLowerCase().includes(q) ||
        r.caregiverName.toLowerCase().includes(q) ||
        r.caseId.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [records, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-['Clash_Grotesk'] text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
        
        {/* Header Block */}
        <div className="flex flex-col justify-between gap-4 py-1 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[32px] font-[500] leading-tight text-[#101828]">
              Post-Match Processing &amp; Credentialing
            </h1>
            <p className="mt-1 text-[14px] text-[#667085]">
              Track case-specific credentialing, verify compliance requirements, and approve readiness before assignment deployment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/referrals"
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#eaecf0] bg-white px-3.5 py-2.5 text-[14px] font-[500] text-[#344054] shadow-xs hover:bg-[#F8FAFC] transition-colors"
            >
              &larr; Cases &amp; Referrals
            </Link>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#667085] uppercase tracking-wider block">Total In Processing</span>
            <span className="text-[28px] font-[500] text-[#101828] mt-1 block">{metrics.total}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#007AFF] uppercase tracking-wider block">Awaiting Document Review</span>
            <span className="text-[28px] font-[500] text-[#007AFF] mt-1 block">{metrics.awaitingReview}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#B26A00] uppercase tracking-wider block">Outstanding Reqs</span>
            <span className="text-[28px] font-[500] text-[#B26A00] mt-1 block">{metrics.outstandingReqs}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#EF4444] uppercase tracking-wider block">Open Exceptions</span>
            <span className="text-[28px] font-[500] text-[#EF4444] mt-1 block">{metrics.exceptionsCount}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#1E7E34] uppercase tracking-wider block">Ready for Placement</span>
            <span className="text-[28px] font-[500] text-[#1E7E34] mt-1 block">{metrics.readyPlacement}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#D0D5DD] pb-2 text-[14px]">
          {(
            [
              "All Cases",
              "Awaiting Review",
              "Requirements Outstanding",
              "Exceptions & Follow-ups",
              "Ready for Placement",
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
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="max-w-sm relative">
          <input
            type="text"
            placeholder="Search record ID, case, patient, or caregiver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[8px] border border-[#D0D5DD] bg-white px-3.5 py-2 pl-9 text-[14px] text-[#101828] shadow-xs focus:border-[#007AFF] focus:outline-none"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-[#98A2B3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Processing Queue Table */}
        <div className="overflow-hidden rounded-[8px] border border-[#D0D5DD] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-[#D0D5DD] bg-[#F8FAFC] text-[12px] text-[#667085]">
                  <th className="py-3 px-4 font-[500]">Processing ID</th>
                  <th className="py-3 px-4 font-[500]">Case &amp; Patient</th>
                  <th className="py-3 px-4 font-[500]">Candidate Caregiver</th>
                  <th className="py-3 px-4 font-[500]">Match Score</th>
                  <th className="py-3 px-4 font-[500]">Checklist Progress</th>
                  <th className="py-3 px-4 font-[500]">Credentialing</th>
                  <th className="py-3 px-4 font-[500]">Readiness State</th>
                  <th className="py-3 px-4 font-[500] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D0D5DD]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#667085]">
                      No post-match processing records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const verifiedCount = item.requirements.filter(
                      (r) => r.status === "Verified" || r.status === "Not Applicable"
                    ).length;

                    return (
                      <tr key={item.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-[#101828]">
                          <Link href={`/post-match/${item.id}`} className="hover:text-[#007AFF]">
                            {item.id}
                          </Link>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#101828]">{item.patientName}</div>
                          <div className="font-mono text-[11px] text-[#667085]">{item.caseId} &bull; {item.patientZip}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#101828]">{item.caregiverName}</div>
                          <div className="text-[11px] text-[#667085]">{item.caregiverDiscipline}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono font-semibold text-[#1E7E34]">{item.matchScore}%</span>
                          <span className="text-[11px] text-[#667085] block">Rank #{item.matchRank}</span>
                        </td>

                        <td className="py-3.5 px-4 text-[#344054]">
                          <span className="text-[13px] font-medium">{verifiedCount} / {item.requirements.length}</span>
                          <span className="text-[11px] text-[#667085] block">requirements cleared</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              item.credentialingStatus === "Verified"
                                ? "bg-[#34C759]/15 text-[#1E7E34]"
                                : item.credentialingStatus === "Awaiting Review"
                                ? "bg-[#007AFF]/10 text-[#007AFF]"
                                : "bg-[#FF9500]/15 text-[#B26A00]"
                            }`}
                          >
                            {item.credentialingStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              item.readinessStatus === "Ready for Placement"
                                ? "bg-[#34C759]/15 text-[#1E7E34]"
                                : item.readinessStatus === "Blocked"
                                ? "bg-[#EF4444]/15 text-[#EF4444]"
                                : "bg-[#007AFF]/10 text-[#007AFF]"
                            }`}
                          >
                            {item.readinessStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/post-match/${item.id}`}
                            className="rounded-[6px] border border-[#eaecf0] bg-white px-3 py-1 text-[12px] font-[500] text-[#344054] hover:bg-[#F8FAFC] transition-colors shadow-2xs"
                          >
                            Open Processing &rarr;
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