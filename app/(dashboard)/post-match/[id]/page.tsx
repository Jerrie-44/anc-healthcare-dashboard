// app/(dashboard)/post-match/[id]/page.tsx
"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { getPostMatchById, computeReadiness } from "@/lib/post-match-service";
import { MOCK_CAREGIVERS_DB } from "@/lib/caregiver-service";
import { MOCK_CASES_DB } from "@/lib/referral-service";
import { RequirementItemStatus } from "@/types/post-match";

interface PageProps {
  params: Promise<{ id: string }>;
}

type DetailTab =
  | "Overview"
  | "Referral Context"
  | "Caregiver Info"
  | "Credentialing"
  | "Compliance"
  | "Documents"
  | "Checklist"
  | "Exceptions"
  | "Audit History";

export default function PostMatchDetailWorkspacePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const record = getPostMatchById(id);
  if (!record) notFound();

  const caregiver = MOCK_CAREGIVERS_DB.find((c) => c.id === record.caregiverId);
  const caseRecord = MOCK_CASES_DB.find((c) => c.id === record.caseId);

  const [activeTab, setActiveTab] = useState<DetailTab>("Checklist");
  const [readiness, setReadiness] = useState(computeReadiness(record));

  // Verify Document Action
  const verifyDocument = (docId: string) => {
    const doc = record.documents.find((d) => d.id === docId);
    if (!doc) return;
    doc.reviewStatus = "Verified";
    doc.reviewedBy = "Dr. R. Sterling (Lead Clinical Dispatcher)";
    doc.reviewedAt = new Date().toISOString().replace("T", " ").substring(0, 16);

    record.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      actor: "Dr. R. Sterling",
      action: "Document Verified",
      details: `Verified ${doc.documentName} for assignment ${record.id}.`,
    });

    const newReadiness = computeReadiness(record);
    setReadiness(newReadiness);
    record.readinessStatus = newReadiness;
  };

  // Human Requirement Verification
  const updateRequirementStatus = (reqId: string, nextStatus: RequirementItemStatus) => {
    const req = record.requirements.find((r) => r.id === reqId);
    if (!req) return;
    req.status = nextStatus;
    if (nextStatus === "Verified") {
      req.verifiedBy = "Dr. R. Sterling";
      req.verifiedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
      req.completionDate = new Date().toISOString().split("T")[0];
    }

    record.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      actor: "Dr. R. Sterling",
      action: "Requirement Updated",
      details: `Set requirement "${req.name}" to ${nextStatus}.`,
    });

    const newReadiness = computeReadiness(record);
    setReadiness(newReadiness);
    record.readinessStatus = newReadiness;
  };

  // Resolve Exception
  const resolveException = (excId: string) => {
    const exc = record.exceptions.find((e) => e.id === excId);
    if (!exc) return;
    exc.status = "Resolved";
    exc.resolvedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
    exc.resolutionNotes = "Verified by operator manual cross-check.";

    record.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      actor: "Dr. R. Sterling",
      action: "Exception Resolved",
      details: `Resolved exception ${exc.id} (${exc.category}).`,
    });

    const newReadiness = computeReadiness(record);
    setReadiness(newReadiness);
    record.readinessStatus = newReadiness;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-['Clash_Grotesk'] text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
        
        {/* Header Block */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#D0D5DD] pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#667085] mb-1">
              <Link href="/post-match" className="hover:text-[#007AFF]">Post-Match Processing</Link>
              <span>/</span>
              <span className="font-mono text-[#101828]">{record.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[32px] font-[500] text-[#101828]">
                {record.patientName} &harr; {record.caregiverName}
              </h1>
              <span className={`rounded-full px-3 py-0.5 text-[12px] font-medium ${
                readiness === "Ready for Placement" ? "bg-[#34C759]/15 text-[#1E7E34]" : "bg-[#007AFF]/10 text-[#007AFF]"
              }`}>
                {readiness}
              </span>
            </div>
            <p className="mt-1 text-[14px] text-[#667085]">
              Candidate: <strong className="text-[#101828]">{record.caregiverName}</strong> ({record.caregiverDiscipline}) &bull; Linked Case:{" "}
              <Link href={`/referrals/${record.caseId}`} className="text-[#007AFF] hover:underline font-mono">
                {record.caseId}
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {readiness === "Ready for Placement" ? (
              <Link
                href={`/placements/new?caseId=${record.caseId}&caregiverId=${record.caregiverId}`}
                className="rounded-[6px] bg-[#1E7E34] px-4 py-2 text-[14px] font-medium text-white hover:bg-[#166329] shadow-xs"
              >
                Progress to Placement &rarr;
              </Link>
            ) : (
              <span className="rounded-[6px] bg-[#F2F4F7] border border-[#D0D5DD] px-3.5 py-2 text-[13px] font-medium text-[#667085]">
                Placement Progression Pending Requirements
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#D0D5DD] pb-2 text-[14px]">
          {(
            [
              "Checklist",
              "Credentialing",
              "Compliance",
              "Documents",
              "Exceptions",
              "Referral Context",
              "Caregiver Info",
              "Overview",
              "Audit History",
            ] as DetailTab[]
          ).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-[6px] px-3.5 py-1.5 transition-colors text-[14px] ${
                activeTab === tab
                  ? "bg-[#007AFF]/10 text-[#007AFF] font-[500]"
                  : "text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828]"
              }`}
            >
              {tab}
              {tab === "Exceptions" && record.exceptions.filter((e) => e.status === "Open").length > 0 && (
                <span className="ml-1.5 rounded-full bg-[#EF4444] px-1.5 py-0.2 text-[10px] text-white">
                  {record.exceptions.filter((e) => e.status === "Open").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        {activeTab === "Checklist" && (
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-[18px] font-[500] text-[#101828]">Unified Requirements Checklist</h3>
              <p className="text-[12px] text-[#667085]">
                Consolidated assignment-specific checks. Human verification is explicit; AI extractions are review aids only.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {record.requirements.map((req) => (
                <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded border border-[#eaecf0] p-4 bg-[#F8FAFC] gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-white border border-[#D0D5DD] px-1.5 py-0.5 text-[10px] font-mono text-[#667085]">
                        {req.category}
                      </span>
                      <span className="rounded bg-[#007AFF]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#007AFF]">
                        {req.scope}
                      </span>
                      <strong className="text-[14px] text-[#101828]">{req.name}</strong>
                    </div>
                    <p className="text-[12px] text-[#475467] mt-1">{req.description}</p>
                    {req.notes && <div className="text-[11px] text-[#B26A00] mt-0.5">Note: {req.notes}</div>}
                    {req.verifiedBy && (
                      <div className="text-[11px] text-[#1E7E34] mt-0.5">Verified by {req.verifiedBy} on {req.verifiedAt}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      req.status === "Verified" ? "bg-[#34C759]/15 text-[#1E7E34]" : "bg-[#FF9500]/15 text-[#B26A00]"
                    }`}>
                      {req.status}
                    </span>

                    {req.status !== "Verified" && (
                      <button
                        type="button"
                        onClick={() => updateRequirementStatus(req.id, "Verified")}
                        className="rounded border border-[#D0D5DD] bg-white px-2.5 py-1 text-[12px] font-medium text-[#1E7E34] hover:bg-[#F8FAFC]"
                      >
                        Confirm Verification
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Credentialing" && (
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-[18px] font-[500] text-[#101828]">Credentialing Management</h3>
              <p className="text-[12px] text-[#667085]">
                General caregiver credentials vs. assignment-specific qualifications.
              </p>
            </div>

            {/* General Credentials from Care Givers */}
            <div className="rounded border border-[#D0D5DD] p-4 bg-[#F8FAFC]">
              <span className="font-semibold text-[13px] text-[#101828] block mb-2">
                Caregiver General Credentials (Source: Care Givers Module)
              </span>
              <div className="flex flex-col gap-2">
                {caregiver?.documents.map((d) => (
                  <div key={d.id} className="flex justify-between items-center text-[12px] bg-white p-2.5 rounded border border-[#eaecf0]">
                    <div>
                      <strong className="text-[#101828]">{d.category}</strong>: {d.documentName}
                    </div>
                    <span className="text-[#1E7E34] font-medium">{d.reviewStatus}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment-Specific Credentials */}
            <div className="rounded border border-[#D0D5DD] p-4 bg-white">
              <span className="font-semibold text-[13px] text-[#101828] block mb-2">
                Assignment-Specific Credential Requirements
              </span>
              {record.requirements.filter((r) => r.category === "Assignment-Specific Credentialing").map((req) => (
                <div key={req.id} className="flex justify-between items-center text-[12px] p-2.5 rounded border border-[#eaecf0] bg-[#F8FAFC] mb-2">
                  <div>
                    <span className="font-medium text-[#101828] block">{req.name}</span>
                    <span className="text-[#667085]">{req.description}</span>
                  </div>
                  <span className="text-[#007AFF] font-medium">{req.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Compliance" && (
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-[18px] font-[500] text-[#101828]">Compliance Management</h3>
              <p className="text-[12px] text-[#667085]">
                Track talent pool compliance standards and case-specific patient environment mandates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded border border-[#D0D5DD] p-4 bg-[#F8FAFC] text-[13px]">
                <strong className="text-[#101828] block mb-2">General Talent Pool Compliance:</strong>
                <div className="text-[12px] text-[#475467] leading-relaxed">
                  Caregiver passed general onboarding verification on 2026-11-04. Background check, OIG exclusion check, and HIPAA clearance confirmed on master profile.
                </div>
              </div>

              <div className="rounded border border-[#D0D5DD] p-4 bg-white text-[13px]">
                <strong className="text-[#101828] block mb-2">Assignment-Specific Compliance Status:</strong>
                <div className="text-[12px] text-[#475467] leading-relaxed">
                  Current Status: <strong className="text-[#007AFF]">{record.complianceStatus}</strong>.
                  All clinical directives aligned with physician order protocols.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Documents" && (
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs flex flex-col gap-4">
            <h3 className="text-[18px] font-[500] text-[#101828]">Associated Credential Documents</h3>
            <div className="flex flex-col gap-3">
              {record.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded border border-[#eaecf0] p-4 bg-[#F8FAFC]">
                  <div>
                    <div className="font-medium text-[14px] text-[#101828]">{doc.documentName}</div>
                    <div className="text-[12px] text-[#667085]">
                      {doc.category} &bull; Uploaded: {doc.submissionDate} by {doc.uploadedBy}
                    </div>
                    {doc.rejectionReason && (
                      <div className="text-[11px] text-[#EF4444] mt-1">Clarification note: {doc.rejectionReason}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      doc.reviewStatus === "Verified" ? "bg-[#34C759]/15 text-[#1E7E34]" : "bg-[#007AFF]/10 text-[#007AFF]"
                    }`}>
                      {doc.reviewStatus}
                    </span>
                    {doc.reviewStatus !== "Verified" && (
                      <button
                        type="button"
                        onClick={() => verifyDocument(doc.id)}
                        className="rounded border border-[#D0D5DD] bg-white px-3 py-1 text-[12px] font-medium text-[#007AFF] hover:bg-[#F8FAFC]"
                      >
                        Verify Evidence
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Exceptions" && (
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs flex flex-col gap-4">
            <h3 className="text-[18px] font-[500] text-[#101828]">Exceptions &amp; Follow-ups</h3>
            {record.exceptions.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-[#667085]">
                No exceptions flagged for this candidate.
              </div>
            ) : (
              record.exceptions.map((exc) => (
                <div key={exc.id} className="rounded border border-[#EF4444]/30 bg-[#EF4444]/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[12px] text-[#EF4444]">{exc.id}</span>
                      <strong className="text-[14px] text-[#101828]">{exc.category}</strong>
                    </div>
                    <p className="text-[12px] text-[#344054] mt-1">{exc.description}</p>
                    <span className="text-[11px] text-[#667085] block mt-1">
                      Identified: {exc.detectedAt} &bull; Owner: {exc.assignedOperator}
                    </span>
                  </div>

                  {exc.status === "Open" ? (
                    <button
                      type="button"
                      onClick={() => resolveException(exc.id)}
                      className="rounded bg-[#007AFF] px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-[#0066CC] shrink-0"
                    >
                      Resolve Exception
                    </button>
                  ) : (
                    <span className="rounded-full bg-[#34C759]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#1E7E34]">
                      Resolved
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "Referral Context" && (
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs text-[13px] flex flex-col gap-3">
            <h3 className="text-[16px] font-[500] text-[#101828] border-b border-[#D0D5DD] pb-2">
              Authoritative Referral Profile (Cases &amp; Referrals Module)
            </h3>
            <div>
              <span className="text-[#667085] text-[11px] block">Patient Name</span>
              <strong>{caseRecord?.draftProfile.patientName.value}</strong>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[#667085] text-[11px] block">Location ZIP</span>
                <span>{caseRecord?.draftProfile.zipCode.value}</span>
              </div>
              <div>
                <span className="text-[#667085] text-[11px] block">Authorized Hours</span>
                <span>{caseRecord?.draftProfile.authorizedHoursPerWeek.value} hrs / week</span>
              </div>
            </div>
            <div>
              <span className="text-[#667085] text-[11px] block">Clinical Directives Summary</span>
              <p className="text-[#475467]">{caseRecord?.draftProfile.clinicalNotesSummary.value}</p>
            </div>
          </div>
        )}

        {activeTab === "Caregiver Info" && (
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs text-[13px] flex flex-col gap-3">
            <h3 className="text-[16px] font-[500] text-[#101828] border-b border-[#D0D5DD] pb-2">
              Authoritative Caregiver Profile (Care Givers Module)
            </h3>
            <div>
              <span className="text-[#667085] text-[11px] block">Full Name</span>
              <strong>{caregiver?.personal.fullName.value}</strong>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[#667085] text-[11px] block">Primary Discipline</span>
                <span>{caregiver?.professional.primaryDiscipline.value}</span>
              </div>
              <div>
                <span className="text-[#667085] text-[11px] block">Talent Pool Approval</span>
                <span className="text-[#1E7E34] font-medium">{caregiver?.approvalStatus}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs text-[13px] flex flex-col gap-2.5">
              <h3 className="text-[16px] font-[500] text-[#101828] border-b border-[#D0D5DD] pb-2">Referral Context</h3>
              <div><span className="text-[#667085] text-[11px] block">Patient Name</span><strong>{record.patientName}</strong></div>
              <div><span className="text-[#667085] text-[11px] block">Case Reference</span><span className="font-mono">{record.caseId}</span></div>
              <div><span className="text-[#667085] text-[11px] block">Service Location ZIP</span><span>{record.patientZip}</span></div>
            </div>

            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs text-[13px] flex flex-col gap-2.5">
              <h3 className="text-[16px] font-[500] text-[#101828] border-b border-[#D0D5DD] pb-2">Deterministic Matching Evaluation</h3>
              <div><span className="text-[#667085] text-[11px] block">Match Rank &amp; Score</span><strong className="text-[#1E7E34]">Rank #{record.matchRank} &bull; {record.matchScore}% Match</strong></div>
              <div><span className="text-[#667085] text-[11px] block">Matching Rationale</span><p className="text-[#475467]">{record.matchingRationale}</p></div>
            </div>
          </div>
        )}

        {activeTab === "Audit History" && (
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <h3 className="text-[16px] font-[500] text-[#101828] mb-3">Audit Trail</h3>
            <div className="flex flex-col gap-3 text-[12px]">
              {record.auditLogs.map((log) => (
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
        )}

      </main>
    </div>
  );
}