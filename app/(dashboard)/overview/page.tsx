// app/(dashboard)/overview/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getOverviewDashboardData } from "@/lib/overview-service";
import {
  TaskOwnershipCategory,
  OverviewTaskItem,
  PipelineStageSummary,
  AggregatedActivityItem,
  OperationalExceptionItem,
} from "@/types/overview";

export default function OverviewCommandCenterPage() {
  const [data] = useState(() => getOverviewDashboardData());
  const [taskTab, setTaskTab] = useState<TaskOwnershipCategory>("Assigned to Me");
  const [searchQuery, setSearchQuery] = useState("");

  const displayedTasks = useMemo(() => {
    let list: OverviewTaskItem[] = [];
    if (taskTab === "Assigned to Me") list = data.tasks.assignedToMe;
    else if (taskTab === "Unassigned") list = data.tasks.unassigned;
    else if (taskTab === "Assigned to Others") list = data.tasks.assignedToOthers;
    else if (taskTab === "Escalated / Senior Review") list = data.tasks.seniorReview;

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (t: OverviewTaskItem) =>
        t.title.toLowerCase().includes(q) ||
        t.recordId.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [data, taskTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-['Clash_Grotesk'] text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-8 px-6 lg:px-10">

        {/* 1. Overview Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#D0D5DD] pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#667085] mb-1">
              <span>Operations Hub</span>
              <span>/</span>
              <span className="text-[#101828] font-medium">Overview</span>
              <span>&bull;</span>
              <span>Last updated: {data.lastUpdatedTimestamp}</span>
            </div>
            <h1 className="text-[32px] font-[500] leading-tight text-[#101828]">
              Good morning, Dr. Sterling
            </h1>
            <p className="mt-1 text-[14px] text-[#667085]">
              Unified operational command centre across Referrals, Caregivers, and Placements.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/referrals/new"
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#007AFF] px-3.5 py-2 text-[13px] font-[500] text-white shadow-xs hover:bg-[#0066CC] transition-colors"
            >
              <span>+ New Referral</span>
            </Link>
            <Link
              href="/caregivers/voice-screening"
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#eaecf0] bg-white px-3.5 py-2 text-[13px] font-[500] text-[#344054] shadow-xs hover:bg-[#F8FAFC] transition-colors"
            >
              Voice Screening Queue
            </Link>
            <Link
              href="/placements"
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#eaecf0] bg-white px-3.5 py-2 text-[13px] font-[500] text-[#344054] shadow-xs hover:bg-[#F8FAFC] transition-colors"
            >
              Placements Workspace
            </Link>
          </div>
        </div>

        {/* 2. Compact Operational Metrics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            href="/referrals"
            className="rounded-[8px] border border-[#D0D5DD] bg-white p-4 shadow-xs hover:border-[#007AFF] transition-colors group"
          >
            <span className="text-[11px] font-[500] text-[#667085] uppercase tracking-wider block">
              Total Referrals
            </span>
            <span className="text-[26px] font-[500] text-[#101828] mt-1 block group-hover:text-[#007AFF]">
              {data.metrics.totalReferrals}
            </span>
            <span className="text-[11px] text-[#667085] mt-0.5 block">&rarr; View all cases</span>
          </Link>

          <Link
            href="/referrals"
            className="rounded-[8px] border border-[#D0D5DD] bg-white p-4 shadow-xs hover:border-[#007AFF] transition-colors group"
          >
            <span className="text-[11px] font-[500] text-[#B26A00] uppercase tracking-wider block">
              Awaiting Validation
            </span>
            <span className="text-[26px] font-[500] text-[#B26A00] mt-1 block">
              {data.metrics.referralsAwaitingValidation}
            </span>
            <span className="text-[11px] text-[#667085] mt-0.5 block">&rarr; Validation queue</span>
          </Link>

          <Link
            href="/caregivers"
            className="rounded-[8px] border border-[#D0D5DD] bg-white p-4 shadow-xs hover:border-[#007AFF] transition-colors group"
          >
            <span className="text-[11px] font-[500] text-[#1E7E34] uppercase tracking-wider block">
              Eligible Talent Pool
            </span>
            <span className="text-[26px] font-[500] text-[#1E7E34] mt-1 block">
              {data.metrics.eligibleCaregivers}
            </span>
            <span className="text-[11px] text-[#667085] mt-0.5 block">&rarr; Active roster</span>
          </Link>

          <Link
            href="/caregivers/voice-screening"
            className="rounded-[8px] border border-[#D0D5DD] bg-white p-4 shadow-xs hover:border-[#007AFF] transition-colors group"
          >
            <span className="text-[11px] font-[500] text-[#007AFF] uppercase tracking-wider block">
              Awaiting Review
            </span>
            <span className="text-[26px] font-[500] text-[#007AFF] mt-1 block">
              {data.metrics.applicationsAwaitingReview}
            </span>
            <span className="text-[11px] text-[#667085] mt-0.5 block">&rarr; Onboarding reviews</span>
          </Link>

          <Link
            href="/placements"
            className="rounded-[8px] border border-[#D0D5DD] bg-white p-4 shadow-xs hover:border-[#007AFF] transition-colors group"
          >
            <span className="text-[11px] font-[500] text-[#B26A00] uppercase tracking-wider block">
              Pending Placements
            </span>
            <span className="text-[26px] font-[500] text-[#B26A00] mt-1 block">
              {data.metrics.pendingPlacements}
            </span>
            <span className="text-[11px] text-[#667085] mt-0.5 block">&rarr; In coordination</span>
          </Link>

          <Link
            href="/placements"
            className="rounded-[8px] border border-[#D0D5DD] bg-white p-4 shadow-xs hover:border-[#007AFF] transition-colors group"
          >
            <span className="text-[11px] font-[500] text-[#1E7E34] uppercase tracking-wider block">
              Active Placements
            </span>
            <span className="text-[26px] font-[500] text-[#1E7E34] mt-1 block">
              {data.metrics.activePlacements}
            </span>
            <span className="text-[11px] text-[#667085] mt-0.5 block">&rarr; Active in-home care</span>
          </Link>
        </div>

        {/* 3. Needs Attention Workspace */}
        <section className="rounded-[8px] border border-[#D0D5DD] bg-white p-6 shadow-xs">
          <div className="flex flex-col gap-3 border-b border-[#D0D5DD] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-[500] text-[#101828]">Needs Attention</h2>
                <span className="rounded-full bg-[#007AFF] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  {data.tasks.totalOutstanding} total
                </span>
              </div>
              <p className="text-[12px] text-[#667085] mt-0.5">
                Consolidated operational action items across Referrals, Caregivers, and Placements.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Filter tasks by ID or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[6px] border border-[#D0D5DD] bg-white px-3 py-1.5 text-[13px] text-[#101828] focus:border-[#007AFF] focus:outline-none"
              />
            </div>
          </div>

          {/* Ownership Classification Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#D0D5DD] py-2 text-[13px]">
            {(
              [
                "Assigned to Me",
                "Unassigned",
                "Assigned to Others",
                "Escalated / Senior Review",
              ] as TaskOwnershipCategory[]
            ).map((tab: TaskOwnershipCategory) => {
              let count = 0;
              if (tab === "Assigned to Me") count = data.tasks.assignedToMe.length;
              else if (tab === "Unassigned") count = data.tasks.unassigned.length;
              else if (tab === "Assigned to Others") count = data.tasks.assignedToOthers.length;
              else if (tab === "Escalated / Senior Review") count = data.tasks.seniorReview.length;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTaskTab(tab)}
                  className={`inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 transition-colors ${
                    taskTab === tab
                      ? "bg-[#007AFF]/10 text-[#007AFF] font-[500]"
                      : "text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828]"
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    taskTab === tab ? "bg-[#007AFF] text-white" : "bg-[#F2F4F7] text-[#667085]"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Task List */}
          <div className="mt-4 flex flex-col gap-3">
            {displayedTasks.length === 0 ? (
              <div className="py-12 text-center text-[14px] text-[#667085]">
                You&apos;re all caught up. No tasks currently matching &ldquo;{taskTab}&rdquo;.
              </div>
            ) : (
              displayedTasks.map((t: OverviewTaskItem) => (
                <div
                  key={t.id}
                  className="flex flex-col justify-between gap-3 rounded-[8px] border border-[#eaecf0] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center hover:border-[#007AFF]/40 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-white border border-[#D0D5DD] px-2 py-0.5 text-[11px] font-mono text-[#475467]">
                        {t.module} &bull; {t.recordId}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          t.priority === "Critical"
                            ? "bg-[#EF4444]/15 text-[#EF4444]"
                            : t.priority === "High"
                            ? "bg-[#FF9500]/15 text-[#B26A00]"
                            : "bg-[#007AFF]/10 text-[#007AFF]"
                        }`}
                      >
                        {t.priority}
                      </span>
                      <span className="text-[12px] text-[#667085]">{t.waitingDurationText}</span>
                    </div>

                    <h3 className="text-[15px] font-[500] text-[#101828] mt-1">{t.title}</h3>
                    <p className="text-[13px] text-[#475467] max-w-3xl leading-relaxed">
                      {t.description}
                    </p>

                    {t.assignedOperatorName && (
                      <span className="text-[11px] text-[#667085]">
                        Assignee: <strong className="text-[#344054]">{t.assignedOperatorName}</strong>
                      </span>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    <Link
                      href={t.actionHref}
                      className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#007AFF] px-4 py-2 text-[13px] font-[500] text-white hover:bg-[#0066CC] shadow-xs transition-colors"
                    >
                      <span>{t.primaryActionLabel}</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 4. Pipelines */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Referral Pipeline */}
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-3 mb-3">
                <h3 className="text-[16px] font-[500] text-[#101828]">Cases &amp; Referrals Pipeline</h3>
                <Link href="/referrals" className="text-[12px] text-[#007AFF] hover:underline">
                  All &rarr;
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {data.referralPipeline.map((st: PipelineStageSummary) => (
                  <Link
                    key={st.stageKey}
                    href={st.href}
                    className="flex items-center justify-between rounded p-2 text-[13px] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <span className="text-[#344054]">{st.label}</span>
                    <span className="rounded bg-[#F2F4F7] px-2 py-0.5 font-mono text-[12px] font-semibold text-[#101828]">
                      {st.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4 border-t border-[#eaecf0] pt-2 text-[11px] text-[#667085]">
              Deterministic matching triggers after human validation sign-off.
            </div>
          </div>

          {/* Caregiver Pipeline */}
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-3 mb-3">
                <h3 className="text-[16px] font-[500] text-[#101828]">Caregiver Pipeline</h3>
                <Link href="/caregivers" className="text-[12px] text-[#007AFF] hover:underline">
                  Roster &rarr;
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {data.caregiverPipeline.map((st: PipelineStageSummary) => (
                  <Link
                    key={st.stageKey}
                    href={st.href}
                    className="flex items-center justify-between rounded p-2 text-[13px] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <span className="text-[#344054]">{st.label}</span>
                    <span className="rounded bg-[#F2F4F7] px-2 py-0.5 font-mono text-[12px] font-semibold text-[#101828]">
                      {st.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4 border-t border-[#eaecf0] pt-2 text-[11px] text-[#667085]">
              Human review is mandatory before talent pool enrollment.
            </div>
          </div>

          {/* Placement Pipeline */}
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-3 mb-3">
                <h3 className="text-[16px] font-[500] text-[#101828]">Placement Pipeline</h3>
                <Link href="/placements" className="text-[12px] text-[#007AFF] hover:underline">
                  Workspace &rarr;
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                {data.placementPipeline.map((st: PipelineStageSummary) => (
                  <Link
                    key={st.stageKey}
                    href={st.href}
                    className="flex items-center justify-between rounded p-2 text-[13px] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <span className="text-[#344054]">{st.label}</span>
                    <span className="rounded bg-[#F2F4F7] px-2 py-0.5 font-mono text-[12px] font-semibold text-[#101828]">
                      {st.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4 border-t border-[#eaecf0] pt-2 text-[11px] text-[#667085]">
              Selection creates placement; activation requires full coordination.
            </div>
          </div>
        </section>

        {/* 5. Recent Activity Feed & Exceptions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs lg:col-span-2">
            <h3 className="text-[16px] font-[500] text-[#101828] border-b border-[#D0D5DD] pb-3 mb-3">
              Recent Cross-Module Operational Activity
            </h3>
            <div className="flex flex-col gap-3">
              {data.recentActivity.map((act: AggregatedActivityItem) => (
                <div key={act.id} className="border-b border-[#eaecf0] pb-2.5 last:border-b-0 text-[13px]">
                  <div className="flex items-center justify-between font-medium text-[#101828]">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#F8FAFC] border border-[#D0D5DD] px-1.5 py-0.5 text-[11px] font-mono text-[#667085]">
                        {act.module}
                      </span>
                      <span>{act.action}</span>
                    </div>
                    <span className="text-[11px] text-[#667085]">{act.timestamp}</span>
                  </div>
                  <div className="text-[12px] text-[#667085] mt-0.5">Actor: {act.actor}</div>
                  <div className="text-[#344054] mt-1 flex items-center justify-between">
                    <span>{act.details}</span>
                    <Link href={act.recordHref} className="text-[#007AFF] text-[12px] hover:underline font-mono shrink-0 ml-2">
                      {act.recordId} &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-3 mb-3">
              <h3 className="text-[16px] font-[500] text-[#101828]">Operational Exceptions</h3>
              <span className="rounded-full bg-[#EF4444]/15 px-2 py-0.5 text-[11px] font-medium text-[#EF4444]">
                {data.exceptions.length} alert
              </span>
            </div>

            {data.exceptions.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-[#667085]">
                No unresolved operational exceptions.
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-[13px]">
                {data.exceptions.map((exc: OperationalExceptionItem) => (
                  <div key={exc.id} className="rounded border border-[#EF4444]/30 bg-[#EF4444]/5 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#EF4444] text-[12px]">{exc.category}</span>
                      <span className="font-mono text-[11px] text-[#667085]">{exc.recordId}</span>
                    </div>
                    <p className="text-[12px] text-[#344054] leading-relaxed mb-2">
                      {exc.description}
                    </p>
                    <Link
                      href={exc.actionHref}
                      className="block text-center rounded-[6px] border border-[#eaecf0] bg-white py-1.5 text-[12px] font-medium text-[#344054] hover:bg-[#F8FAFC]"
                    >
                      {exc.nextActionLabel} &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}