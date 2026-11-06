// app/(dashboard)/referrals/[caseId]/page.tsx
"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MOCK_CASES_DB, executeDeterministicMatching } from "@/lib/referral-service";
import { computeDerivedStatus } from "@/types/referral";
import { StatusBadge } from "@/components/application/referrals/status-badge";
import { NextActionCard } from "@/components/application/referrals/next-action-card";

interface PageProps {
  params: Promise<{ caseId: string }>;
}

export default function CaseDetailsViewPage({ params }: PageProps) {
  const { caseId } = use(params);
  const caseRecord = MOCK_CASES_DB.find((c) => c.id.toLowerCase() === caseId.toLowerCase());
  if (!caseRecord) notFound();

  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string | null>(null);

  const handleRecalculateMatches = () => {
    const recs = executeDeterministicMatching(caseRecord);
    caseRecord.recommendations = recs;
    caseRecord.matchingStatus = "Recommendations Ready";
  };

  const schedule = caseRecord.draftProfile.schedule;
  const derived = computeDerivedStatus(caseRecord);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-['Clash_Grotesk'] text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
        
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#D0D5DD] pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#667085] mb-1">
              <Link href="/referrals" className="hover:text-[#007AFF]">Cases &amp; Referrals</Link>
              <span>/</span>
              <span className="font-mono text-[#101828]">{caseRecord.id}</span>
              <span>/</span>
              <span>Profile v{caseRecord.validatedProfileVersion || 1}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[32px] font-[500] leading-tight text-[#101828]">
                {caseRecord.draftProfile.patientName.value}
              </h1>
              <StatusBadge status={derived} />
            </div>
            <p className="mt-1 text-[14px] text-[#667085]">
              Source: {caseRecord.referralSource} &bull; Received: {caseRecord.dateReceived} &bull; Validated: {caseRecord.validatedAt || "Pending Validation"}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/referrals/${caseRecord.id}/validate`}
              className="rounded-[6px] border border-[#D0D5DD] bg-white px-3.5 py-2 text-[14px] font-[500] text-[#344054] hover:bg-[#F8FAFC] transition-colors"
            >
              Open Validation &amp; Schedule Desk &rarr;
            </Link>
          </div>
        </div>

        {/* Action Callout Card */}
        <NextActionCard
          caseId={caseRecord.id}
          status={derived}
          missingFieldsCount={caseRecord.draftProfile.missingRequiredFields.length}
        />

        {/* 3-Column Workspace Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Left Column (2 Spans): Care & Schedule Requirements + Matching Recommendations */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            
            {/* Structured Care Schedule Requirements Display */}
            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-3 mb-3">
                <div>
                  <h2 className="text-[18px] font-[500] text-[#101828]">Care Schedule Requirements</h2>
                  <p className="text-[12px] text-[#667085]">
                    Validated profile constraints used by the deterministic matching engine.
                  </p>
                </div>
                <Link
                  href={`/referrals/${caseRecord.id}/validate`}
                  className="text-[12px] text-[#007AFF] hover:underline"
                >
                  Edit Schedule &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
                <div className="rounded bg-[#F8FAFC] p-3 border border-[#D0D5DD]">
                  <span className="text-[11px] text-[#667085] block">Start Date</span>
                  <strong className="text-[#101828]">{schedule.startDate.value || "Immediate"}</strong>
                </div>
                <div className="rounded bg-[#F8FAFC] p-3 border border-[#D0D5DD]">
                  <span className="text-[11px] text-[#667085] block">Frequency Type</span>
                  <strong className="text-[#101828]">{schedule.recurringType.value}</strong>
                </div>
                <div className="rounded bg-[#F8FAFC] p-3 border border-[#D0D5DD]">
                  <span className="text-[11px] text-[#667085] block">Authorized Hours</span>
                  <strong className="text-[#101828]">{schedule.hoursPerWeek.value} hrs / week</strong>
                </div>
                <div className="rounded bg-[#F8FAFC] p-3 border border-[#D0D5DD]">
                  <span className="text-[11px] text-[#667085] block">Schedule Status</span>
                  <strong className="text-[#1E7E34]">{caseRecord.schedulingStatus}</strong>
                </div>
              </div>

              {/* Required Days */}
              <div className="mt-3 text-[13px]">
                <span className="text-[12px] text-[#667085] block mb-1">Required Days of Care:</span>
                <div className="flex flex-wrap gap-1.5">
                  {schedule.requiredDays.value.map((day) => (
                    <span key={day} className="rounded bg-[#007AFF]/10 border border-[#007AFF]/30 px-2.5 py-0.5 text-[12px] font-medium text-[#007AFF]">
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              {/* Time Windows */}
              <div className="mt-3 text-[13px]">
                <span className="text-[12px] text-[#667085] block mb-1">Requested Time Windows:</span>
                <div className="flex flex-wrap gap-1.5">
                  {schedule.timeWindows.value.map((win) => (
                    <span key={win} className="rounded bg-[#F8FAFC] border border-[#D0D5DD] px-2.5 py-0.5 text-[12px] text-[#344054]">
                      {win}
                    </span>
                  ))}
                </div>
              </div>

              {schedule.schedulingConstraints.value && (
                <div className="mt-3 rounded bg-[#F8FAFC] border border-[#D0D5DD] p-2.5 text-[12px] text-[#475467]">
                  <strong>Scheduling Directives:</strong> {schedule.schedulingConstraints.value}
                </div>
              )}
            </div>

            {/* Deterministic Caregiver Matching Recommendations */}
            <div id="matching-section" className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-3 mb-4">
                <div>
                  <h2 className="text-[18px] font-[500] text-[#101828]">Caregiver Matching Recommendations</h2>
                  <p className="text-[12px] text-[#667085]">
                    Ranked deterministically by credential alignment, proximity, and reported schedule compatibility.
                  </p>
                </div>
                {caseRecord.validationStatus === "Validated" && (
                  <button
                    type="button"
                    onClick={handleRecalculateMatches}
                    className="rounded-[6px] border border-[#D0D5DD] px-3 py-1 text-[12px] font-medium text-[#344054] hover:bg-[#F8FAFC]"
                  >
                    Recalculate Matches
                  </button>
                )}
              </div>

              {caseRecord.recommendations.length === 0 ? (
                <div className="py-8 text-center text-[14px] text-[#667085]">
                  No caregiver recommendations generated yet. Confirm validation to run the matching engine.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {caseRecord.recommendations.map((rec, index) => {
                    const isSelected = selectedCaregiverId === rec.caregiverId;
                    const schedCompat = rec.scheduleCompatibility;

                    return (
                      <div
                        key={rec.caregiverId}
                        onClick={() => setSelectedCaregiverId(rec.caregiverId)}
                        className={`rounded-[6px] border p-4 cursor-pointer transition-colors ${
                          isSelected
                            ? "border-[#007AFF] bg-white ring-2 ring-[#007AFF]/15 shadow-xs"
                            : "border-[#D0D5DD] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#101828] text-[11px] font-bold text-white">
                              {index + 1}
                            </span>
                            <span className="font-[500] text-[15px] text-[#101828]">{rec.caregiverName}</span>
                            <span className="text-[12px] text-[#667085]">({rec.discipline})</span>
                          </div>
                          <span className="font-mono text-[14px] font-semibold text-[#1E7E34]">
                            {rec.matchScore}% Match
                          </span>
                        </div>

                        {/* Schedule Compatibility Badge & Detail */}
                        <div className="my-2 flex flex-col gap-1 rounded bg-[#F8FAFC] border border-[#D0D5DD] p-2.5 text-[12px]">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[#101828]">Schedule Compatibility:</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                schedCompat.outcome === "Full Schedule Match"
                                  ? "bg-[#34C759]/15 text-[#1E7E34]"
                                  : schedCompat.outcome === "Partial Match"
                                  ? "bg-[#FF9500]/15 text-[#B26A00]"
                                  : "bg-[#EF4444]/15 text-[#EF4444]"
                              }`}
                            >
                              {schedCompat.outcome}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#475467]">{schedCompat.details}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 my-2 text-[12px]">
                          <span className="rounded bg-white border border-[#D0D5DD] px-2 py-0.5 text-[#344054]">
                            Distance: {rec.distanceMiles} miles
                          </span>
                          <span className="rounded bg-white border border-[#D0D5DD] px-2 py-0.5 text-[#344054]">
                            Caseload: {rec.activeCaseload}/{rec.maxCaseload} active
                          </span>
                          {rec.credentials.map((cred) => (
                            <span key={cred} className="rounded bg-white border border-[#D0D5DD] px-2 py-0.5 text-[#007AFF]">
                              {cred}
                            </span>
                          ))}
                        </div>

                        <p className="text-[12px] text-[#475467] mt-1">
                          <strong>Rationale:</strong> {rec.matchingRationale}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (1 Span): Placement Decision & Activity Trail */}
          <div className="flex flex-col gap-6">
            
            {/* Operator Placement Decision Desk */}
            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
              <h3 className="text-[18px] font-[500] text-[#101828] mb-1">Human Review &amp; Placement</h3>
              <p className="text-[12px] text-[#667085] mb-4">
                Clinical operator selection is required before placement creation.
              </p>

              <div className="flex flex-col gap-3">
                <div className="text-[14px]">
                  <span className="text-[#667085]">Selected Candidate:</span>{" "}
                  <strong className="text-[#101828]">
                    {selectedCaregiverId
                      ? caseRecord.recommendations.find((r) => r.caregiverId === selectedCaregiverId)?.caregiverName || selectedCaregiverId
                      : "Select a candidate from the left"}
                  </strong>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#344054]">Reviewer Notes</label>
                  <textarea
                    rows={3}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter placement clearance notes or specific scheduling instructions..."
                    className="mt-1 w-full rounded-[6px] border border-[#D0D5DD] p-2 text-[14px] text-[#101828] focus:border-[#007AFF] focus:outline-none"
                  />
                </div>

                <Link
                  href={
                    selectedCaregiverId
                      ? `/placements/new?caseId=${caseRecord.id}&caregiverId=${selectedCaregiverId}`
                      : "#"
                  }
                  className={`block text-center rounded-[6px] py-2.5 text-[14px] font-medium transition-colors shadow-xs ${
                    selectedCaregiverId
                      ? "bg-[#007AFF] text-white hover:bg-[#0066CC]"
                      : "bg-[#D0D5DD] text-[#667085] pointer-events-none"
                  }`}
                >
                  Confirm Selection &amp; Create Placement &rarr;
                </Link>
              </div>
            </div>

            {/* Audit & Activity Log */}
            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
              <h3 className="text-[16px] font-[500] text-[#101828] mb-3">Case Activity History</h3>
              <div className="flex flex-col gap-3 text-[12px]">
                {caseRecord.activityLogs.map((log) => (
                  <div key={log.id} className="border-b border-[#D0D5DD] pb-2 last:border-b-0">
                    <div className="flex justify-between font-medium text-[#101828]">
                      <span>{log.action}</span>
                      <span className="text-[10px] text-[#667085]">{log.timestamp}</span>
                    </div>
                    <div className="text-[#667085]">Actor: {log.actor}</div>
                    {log.details && <div className="text-[#344054] mt-0.5">{log.details}</div>}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}