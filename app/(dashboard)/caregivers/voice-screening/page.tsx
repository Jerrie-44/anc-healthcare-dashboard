// app/(dashboard)/caregivers/voice-screening/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_INTERVIEW_SESSIONS } from "@/lib/interview-service";
import {
  InterviewSessionRecord,
  SessionLifecycleStatus,
  HumanReviewStatus,
} from "@/types/interview-session";

type QueueTab =
  | "All Sessions"
  | "Awaiting Review"
  | "Requires Follow-up"
  | "Interrupted / Failed"
  | "Reviewed";

export default function VoiceScreeningSessionsPage() {
  const [sessions, setSessions] = useState<InterviewSessionRecord[]>(MOCK_INTERVIEW_SESSIONS);
  const [activeTab, setActiveTab] = useState<QueueTab>("Awaiting Review");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: sessions.length,
      awaitingReview: sessions.filter((s) => s.reviewStatus === "Awaiting Human Review").length,
      requiresFollowUp: sessions.filter((s) => s.reviewStatus === "Requires Follow-up").length,
      interruptedOrFailed: sessions.filter(
        (s) => s.sessionStatus === "Interrupted" || s.sessionStatus === "Failed"
      ).length,
      reviewed: sessions.filter((s) => s.reviewStatus === "Reviewed").length,
    };
  }, [sessions]);

  // Filtering
  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      let matchesTab = true;
      if (activeTab === "Awaiting Review") matchesTab = s.reviewStatus === "Awaiting Human Review";
      else if (activeTab === "Requires Follow-up") matchesTab = s.reviewStatus === "Requires Follow-up";
      else if (activeTab === "Interrupted / Failed") {
        matchesTab = s.sessionStatus === "Interrupted" || s.sessionStatus === "Failed";
      } else if (activeTab === "Reviewed") matchesTab = s.reviewStatus === "Reviewed";

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        s.sessionId.toLowerCase().includes(q) ||
        s.caregiverName.toLowerCase().includes(q) ||
        s.caregiverId.toLowerCase().includes(q);

      const matchesType = typeFilter === "All" || s.interviewType === typeFilter;

      return matchesTab && matchesSearch && matchesType;
    });
  }, [sessions, activeTab, searchQuery, typeFilter]);

  const renderSessionStatusBadge = (status: SessionLifecycleStatus) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#34C759]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#1E7E34]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />
            Completed
          </span>
        );
      case "Interrupted":
      case "Requires Follow-up":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF9500]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#B26A00]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF9500]" />
            {status}
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#007AFF]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#007AFF]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF] animate-pulse" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2F4F7] px-2.5 py-0.5 text-[11px] font-medium text-[#667085]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#98A2B3]" />
            {status}
          </span>
        );
    }
  };

  const renderReviewStatusBadge = (review: HumanReviewStatus) => {
    switch (review) {
      case "Reviewed":
        return (
          <span className="inline-flex rounded-full bg-[#34C759]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#1E7E34]">
            Reviewed
          </span>
        );
      case "Awaiting Human Review":
        return (
          <span className="inline-flex rounded-full bg-[#007AFF]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#007AFF]">
            Awaiting Review
          </span>
        );
      case "Requires Follow-up":
        return (
          <span className="inline-flex rounded-full bg-[#FF9500]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#B26A00]">
            Requires Follow-up
          </span>
        );
      default:
        return (
          <span className="inline-flex rounded-full bg-[#F2F4F7] px-2.5 py-0.5 text-[11px] font-medium text-[#667085]">
            {review}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-['Clash_Grotesk'] text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
        
        {/* Header Block */}
        <div className="flex flex-col justify-between gap-4 py-1 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#667085] mb-1">
              <Link href="/caregivers" className="hover:text-[#007AFF]">Caregivers</Link>
              <span>/</span>
              <span>Voice Screening Management</span>
            </div>
            <h1 className="text-[32px] font-[500] leading-tight text-[#101828]">
              AI Voice Interview Sessions
            </h1>
            <p className="mt-1 text-[14px] text-[#667085]">
              Autonomous conversational intakes, NLP transcript structuring, clarification queues, and operator audit checks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/caregivers"
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#eaecf0] bg-white px-3.5 py-2.5 text-[14px] font-[500] text-[#344054] shadow-xs hover:bg-[#F8FAFC] transition-colors"
            >
              &larr; All Caregivers Roster
            </Link>
          </div>
        </div>

        {/* Actionable KPI Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#667085] uppercase tracking-wider block">Total Sessions</span>
            <span className="text-[28px] font-[500] text-[#101828] mt-1 block">{metrics.total}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#007AFF] uppercase tracking-wider block">Awaiting Operator Review</span>
            <span className="text-[28px] font-[500] text-[#007AFF] mt-1 block">{metrics.awaitingReview}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#B26A00] uppercase tracking-wider block">Requires Follow-up</span>
            <span className="text-[28px] font-[500] text-[#B26A00] mt-1 block">{metrics.requiresFollowUp}</span>
          </div>
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#1E7E34] uppercase tracking-wider block">Fully Reviewed &amp; Synced</span>
            <span className="text-[28px] font-[500] text-[#1E7E34] mt-1 block">{metrics.reviewed}</span>
          </div>
        </div>

        {/* Queue Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#D0D5DD] pb-2 text-[14px]">
          {(
            [
              "Awaiting Review",
              "Requires Follow-up",
              "Interrupted / Failed",
              "Reviewed",
              "All Sessions",
            ] as QueueTab[]
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
              {tab === "Awaiting Review" && metrics.awaitingReview > 0 && (
                <span className="ml-1.5 rounded-full bg-[#007AFF] px-1.5 py-0.2 text-[10px] text-white">
                  {metrics.awaitingReview}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by session ID, caregiver, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[8px] border border-[#D0D5DD] bg-white px-3.5 py-2 pl-9 text-[14px] text-[#101828] shadow-xs focus:border-[#007AFF] focus:outline-none"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-[#98A2B3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#667085]">Interview Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-[8px] border border-[#D0D5DD] bg-white px-3 py-2 text-[14px] text-[#344054] shadow-xs focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Initial Screening">Initial Screening</option>
              <option value="Follow-up Clarification">Follow-up Clarification</option>
              <option value="Clinical Competency Reassessment">Clinical Competency Reassessment</option>
            </select>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="overflow-hidden rounded-[8px] border border-[#D0D5DD] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-[#D0D5DD] bg-[#F8FAFC] text-[12px] text-[#667085]">
                  <th className="py-3 px-4 font-[500]">Session ID</th>
                  <th className="py-3 px-4 font-[500]">Caregiver</th>
                  <th className="py-3 px-4 font-[500]">Type &amp; Version</th>
                  <th className="py-3 px-4 font-[500]">Date &amp; Duration</th>
                  <th className="py-3 px-4 font-[500]">Call Status</th>
                  <th className="py-3 px-4 font-[500]">AI Extraction</th>
                  <th className="py-3 px-4 font-[500]">Human Review</th>
                  <th className="py-3 px-4 font-[500] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D0D5DD]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#667085]">
                      No voice screening sessions found in this view.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.sessionId} className="hover:bg-[#F8FAFC]/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-[#101828]">
                        <Link href={`/caregivers/voice-screening/${s.sessionId}`} className="hover:text-[#007AFF]">
                          {s.sessionId}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#101828]">{s.caregiverName}</div>
                        <div className="font-mono text-[11px] text-[#667085]">{s.caregiverId}</div>
                      </td>

                      <td className="py-3.5 px-4 text-[#344054]">
                        <div>{s.interviewType}</div>
                        <div className="font-mono text-[11px] text-[#667085]">{s.questionSetVersion}</div>
                      </td>

                      <td className="py-3.5 px-4 text-[#667085]">
                        <div>{s.date}</div>
                        <div className="text-[12px]">
                          {s.durationSeconds ? `${Math.floor(s.durationSeconds / 60)} min` : "Incomplete"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {renderSessionStatusBadge(s.sessionStatus)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          s.processingStatus === "Completed" ? "bg-[#34C759]/15 text-[#1E7E34]" : "bg-[#FF9500]/15 text-[#B26A00]"
                        }`}>
                          {s.processingStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {renderReviewStatusBadge(s.reviewStatus)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/caregivers/voice-screening/${s.sessionId}`}
                          className="rounded-[6px] border border-[#eaecf0] bg-white px-3 py-1 text-[12px] font-[500] text-[#344054] hover:bg-[#F8FAFC] transition-colors shadow-2xs"
                        >
                          {s.reviewStatus === "Awaiting Human Review" ? "Review & Sync \u2192" : "Inspect Session"}
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