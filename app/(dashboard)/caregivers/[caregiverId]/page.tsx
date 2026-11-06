// app/(dashboard)/caregivers/[caregiverId]/page.tsx
"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MOCK_CAREGIVERS_DB } from "@/lib/caregiver-service";
import { MOCK_INTERVIEW_SESSIONS } from "@/lib/interview-service";
import { computeMatchingEligibility } from "@/types/caregiver";

interface PageProps {
  params: Promise<{ caregiverId: string }>;
}

export default function CaregiverInternalProfilePage({ params }: PageProps) {
  const { caregiverId } = use(params);
  const caregiver = MOCK_CAREGIVERS_DB.find((c) => c.id.toLowerCase() === caregiverId.toLowerCase());
  if (!caregiver) notFound();

  const [approvalNotes, setApprovalNotes] = useState("");
  const [decisionRecorded, setDecisionRecorded] = useState<boolean>(caregiver.approvalStatus === "Approved");

  const caregiverInterviews = MOCK_INTERVIEW_SESSIONS.filter((s) => s.caregiverId === caregiver.id);

  const handleApprove = () => {
    caregiver.approvalStatus = "Approved";
    caregiver.applicationStatus = "Approved";
    caregiver.humanApproval = {
      decision: "Approved",
      decidedBy: "Dr. R. Sterling (Lead Clinical Dispatcher)",
      decidedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      decisionNotes: approvalNotes || "Full compliance and clinical credentials verified.",
    };
    caregiver.auditHistory.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      actor: "Dr. R. Sterling",
      action: "Caregiver Approved",
      eventType: "Human Approval Decision",
      details: "Approved for talent pool and case matching readiness.",
    });
    setDecisionRecorded(true);
  };

  const eligibility = computeMatchingEligibility(caregiver);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-['Clash_Grotesk'] text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
        
        {/* Breadcrumb & Profile Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#D0D5DD] pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#667085] mb-1">
              <Link href="/caregivers" className="hover:text-[#007AFF]">Caregivers</Link>
              <span>/</span>
              <span className="font-mono text-[#101828]">{caregiver.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[32px] font-[500] text-[#101828]">
                {caregiver.personal.fullName.value}
              </h1>
              <span className={`rounded-full px-3 py-0.5 text-[12px] font-medium ${
                caregiver.approvalStatus === "Approved" ? "bg-[#34C759]/15 text-[#1E7E34]" : "bg-[#007AFF]/10 text-[#007AFF]"
              }`}>
                {caregiver.approvalStatus}
              </span>
            </div>
            <p className="mt-1 text-[14px] text-[#667085]">
              {caregiver.professional.primaryDiscipline.value} &bull; Territory: {caregiver.personal.city.value}, PA ({caregiver.personal.zipCode.value})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/caregivers"
              className="rounded-[6px] border border-[#eaecf0] bg-white px-3.5 py-2 text-[14px] font-medium text-[#344054] hover:bg-[#F8FAFC]"
            >
              &larr; Directory
            </Link>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Main Details (2 Spans) */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            
            {/* AI Voice Interview Sessions Card */}
            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-3 mb-3">
                <div>
                  <h3 className="text-[18px] font-[500] text-[#101828]">AI Voice Interview Sessions</h3>
                  <p className="text-[12px] text-[#667085]">
                    Chronological record of conversational screening calls and follow-ups.
                  </p>
                </div>
                <Link
                  href="/caregivers/voice-screening"
                  className="rounded border border-[#eaecf0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#344054] hover:bg-[#F8FAFC]"
                >
                  Screening Queue &rarr;
                </Link>
              </div>

              {caregiverInterviews.length === 0 ? (
                <div className="py-6 text-center text-[13px] text-[#667085]">
                  No AI voice interview sessions recorded yet.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {caregiverInterviews.map((sess) => (
                    <div
                      key={sess.sessionId}
                      className="flex items-center justify-between rounded border border-[#D0D5DD] p-3 bg-[#F8FAFC]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-[13px] text-[#101828]">{sess.sessionId}</span>
                          <span className="text-[12px] text-[#667085]">({sess.interviewType})</span>
                        </div>
                        <div className="text-[11px] text-[#667085] mt-0.5">
                          Date: {sess.date} &bull; Call: {sess.sessionStatus} &bull; Review: {sess.reviewStatus}
                        </div>
                      </div>

                      <Link
                        href={`/caregivers/voice-screening/${sess.sessionId}`}
                        className="rounded border border-[#eaecf0] bg-white px-2.5 py-1 text-[12px] font-medium text-[#007AFF] hover:bg-[#F8FAFC]"
                      >
                        Inspect Session &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Screening Review Summary */}
            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-3 mb-3">
                <h3 className="text-[18px] font-[500] text-[#101828]">AI Voice Screening Audit</h3>
                <span className="font-mono text-[12px] text-[#667085]">
                  Session: {caregiver.screening.sessionId || "N/A"}
                </span>
              </div>
              <p className="text-[14px] text-[#344054] leading-relaxed mb-3">
                {caregiver.screening.transcriptSummary || "No transcript summary recorded."}
              </p>
              <div className="rounded bg-[#F8FAFC] p-3 text-[13px] border border-[#D0D5DD]">
                <strong className="text-[#101828] block mb-1">AI Entity Structuring:</strong>
                <span className="text-[#475467]">{caregiver.screening.aiExtractedSummary || "Pending structuring."}</span>
              </div>
            </div>

            {/* Submitted Credentials & Compliance Documents */}
            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
              <h3 className="text-[18px] font-[500] text-[#101828] mb-3">Submitted Credentials &amp; Documents</h3>
              <div className="flex flex-col gap-2.5">
                {caregiver.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded border border-[#D0D5DD] p-3 bg-[#F8FAFC]">
                    <div>
                      <div className="font-medium text-[14px] text-[#101828]">{doc.category}</div>
                      <div className="font-mono text-[12px] text-[#667085]">{doc.documentName} &bull; Submitted: {doc.submissionDate}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      doc.reviewStatus === "Verified" ? "bg-[#34C759]/15 text-[#1E7E34]" : "bg-[#FF9500]/15 text-[#B26A00]"
                    }`}>
                      {doc.reviewStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reported Schedule */}
            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
              <h3 className="text-[18px] font-[500] text-[#101828] mb-1">Caregiver-Reported Schedule</h3>
              <p className="text-[12px] text-[#667085] mb-3">
                Updated on {caregiver.availability.lastUpdatedAt}.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
                {caregiver.availability.weeklySlots.filter((s) => s.enabled).map((slot) => (
                  <div key={slot.day} className="rounded bg-[#F8FAFC] border border-[#D0D5DD] p-2.5">
                    <span className="font-semibold text-[#101828] block">{slot.day}</span>
                    <span className="text-[#667085] text-[11px]">
                      {[slot.morning && "Morn", slot.afternoon && "Aft", slot.evening && "Eve"].filter(Boolean).join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Panel: Human Approval Desk & Audit */}
          <div className="flex flex-col gap-6">
            
            {/* Human Approval Decision Desk */}
            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
              <h3 className="text-[18px] font-[500] text-[#101828] mb-1">Human Approval Desk</h3>
              <p className="text-[12px] text-[#667085] mb-4">
                Clinical operator sign-off is mandatory before entry into the eligible matching pool.
              </p>

              <div className="flex flex-col gap-3">
                <div className="text-[13px]">
                  <span className="text-[#667085]">Current Status:</span>{" "}
                  <strong className="text-[#101828]">{caregiver.approvalStatus}</strong>
                </div>

                <div className="text-[13px]">
                  <span className="text-[#667085]">Matching Readiness:</span>{" "}
                  <strong className={eligibility === "Eligible" ? "text-[#1E7E34]" : "text-[#B26A00]"}>
                    {eligibility}
                  </strong>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#344054]">Reviewer Notes</label>
                  <textarea
                    rows={3}
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Enter board verification numbers or supervisor clearance notes..."
                    className="mt-1 w-full rounded-[6px] border border-[#D0D5DD] p-2 text-[14px] focus:outline-none focus:border-[#007AFF]"
                  />
                </div>

                {decisionRecorded ? (
                  <div className="rounded-[6px] bg-[#34C759]/10 p-2.5 text-center text-[13px] font-medium text-[#1E7E34]">
                    Caregiver Approved &amp; Enrolled in Talent Pool
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="rounded-[6px] bg-[#007AFF] py-2.5 text-[14px] font-medium text-white hover:bg-[#0066CC] transition-colors shadow-xs"
                  >
                    Grant Human Approval &rarr;
                  </button>
                )}
              </div>
            </div>

            {/* Audit History */}
            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
              <h3 className="text-[16px] font-[500] text-[#101828] mb-3">Activity &amp; Audit Trail</h3>
              <div className="flex flex-col gap-3 text-[12px]">
                {caregiver.auditHistory.map((log) => (
                  <div key={log.id} className="border-b border-[#D0D5DD] pb-2 last:border-b-0">
                    <div className="flex justify-between font-medium text-[#101828]">
                      <span>{log.action}</span>
                      <span className="text-[10px] text-[#667085]">{log.timestamp}</span>
                    </div>
                    <div className="text-[#667085]">Actor: {log.actor}</div>
                    <div className="text-[#344054] mt-0.5">{log.details}</div>
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