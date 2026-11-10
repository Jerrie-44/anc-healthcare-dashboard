// components/application/cases-intake/case-details-drawer.tsx
"use client";

import { useState, useEffect } from "react";
import { CaseIntakeRecord, RankedCaregiverMatch } from "@/types/cases-intake";

interface Props {
  isOpen: boolean;
  caseRecord: CaseIntakeRecord | null;
  onClose: () => void;
  onValidate: (caseId: string, candidate: RankedCaregiverMatch, notes: string) => void;
  onReject: (caseId: string, candidateId: string, reason: string) => void;
  onCorrect: (caseId: string, zipCode: string, discipline: string) => void;
}

export function CaseDetailsDrawer({
  isOpen,
  caseRecord,
  onClose,
  onValidate,
  onReject,
  onCorrect,
}: Props) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [validationNotes, setValidationNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [flagNote, setFlagNote] = useState("");
  const [isFlagging, setIsFlagging] = useState(false);

  // Incomplete Case Correction
  const [editZip, setEditZip] = useState("");
  const [editDiscipline, setEditDiscipline] = useState("");

  useEffect(() => {
    if (caseRecord) {
      setEditZip(caseRecord.zipCode || "");
      setEditDiscipline(caseRecord.disciplineNeeded || "");
      if (caseRecord.matchResults?.shortlist?.[0]) {
        setSelectedCandidateId(caseRecord.matchResults.shortlist[0].caregiverId);
      }
      setIsRejecting(false);
      setIsFlagging(false);
      setValidationNotes("");
    }
  }, [caseRecord]);

  if (!isOpen || !caseRecord) return null;

  const shortlist = caseRecord.matchResults?.shortlist || [];
  const activeCandidate =
    shortlist.find((c) => c.caregiverId === selectedCandidateId) || shortlist[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/40 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl overflow-y-auto">
        
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EAECF0] bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[13px] font-bold text-[#101828]">
              {caseRecord.id}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                caseRecord.status === "Pending Review"
                  ? "bg-[#007AFF]/10 text-[#007AFF]"
                  : caseRecord.status === "Validated"
                  ? "bg-[#34C759]/15 text-[#248A3D]"
                  : caseRecord.status === "Needs Information"
                  ? "bg-[#FF3B30]/10 text-[#FF3B30]"
                  : caseRecord.status === "Unmatched"
                  ? "bg-[#F79009]/15 text-[#B26A00]"
                  : "bg-[#F2F4F7] text-[#475467]"
              }`}
            >
              {caseRecord.status}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828]"
          >
            ✕
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex flex-col gap-6 p-6">
          
          {/* SECTION A: Care Requirement */}
          <section className="rounded-xl border border-[#EAECF0] bg-[#F8FAFC] p-4">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                Section A &bull; Care Requirement Profile
              </span>
              <span className="text-[11px] text-[#667085]">{caseRecord.referralSource}</span>
            </div>

            <div className="mt-3">
              <h2 className="text-[18px] font-semibold text-[#101828]">
                {caseRecord.patientName}
              </h2>
              <p className="mt-1 text-[13px] text-[#475467]">
                {caseRecord.clinicalDirectives}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <span className="text-[#667085] block">Discipline Required:</span>
                <strong className="text-[#101828] text-[13px]">
                  {caseRecord.disciplineNeeded || <span className="text-[#FF3B30]">Missing</span>}
                </strong>
              </div>
              <div>
                <span className="text-[#667085] block">Location (ZIP):</span>
                <strong className="font-mono text-[#101828] text-[13px]">
                  {caseRecord.zipCode || <span className="text-[#FF3B30]">Missing</span>}
                </strong>
              </div>
              <div>
                <span className="text-[#667085] block">Schedule Intensity:</span>
                <strong className="text-[#101828]">{caseRecord.hoursPerWeek} hrs/week</strong>
              </div>
              <div>
                <span className="text-[#667085] block">Household Restrictions:</span>
                <strong className={caseRecord.nonSmokingHousehold ? "text-[#007AFF]" : "text-[#101828]"}>
                  {caseRecord.nonSmokingHousehold ? "Strict Non-Smoker Required" : "No Smoking Restriction"}
                </strong>
              </div>
            </div>

            {/* Incomplete Information Editor */}
            {caseRecord.status === "Needs Information" && (
              <div className="mt-4 rounded-lg border border-[#FF3B30]/30 bg-[#FF3B30]/5 p-3.5">
                <span className="text-[12px] font-semibold text-[#FF3B30] block mb-2">
                  Missing information prevents reliable auto-matching. Update criteria:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editZip}
                    onChange={(e) => setEditZip(e.target.value)}
                    placeholder="ZIP Code (e.g. 15213)"
                    className="rounded border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[12px]"
                  />
                  <input
                    type="text"
                    value={editDiscipline}
                    onChange={(e) => setEditDiscipline(e.target.value)}
                    placeholder="Discipline (e.g. Registered Nurse)"
                    className="rounded border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[12px]"
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onCorrect(caseRecord.id, editZip, editDiscipline)}
                    className="rounded bg-[#007AFF] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#0062CC]"
                  >
                    Save &amp; Trigger Match Engine &rarr;
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* SECTION B: Caregiver Match Recommendations */}
          <section>
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                Section B &bull; Caregiver Recommendations ({shortlist.length})
              </span>
              <span className="text-[11px] text-[#34C759] font-medium">
                Auto-Matched via Match Engine
              </span>
            </div>

            {shortlist.length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed border-[#D0D5DD] p-6 text-center text-[#667085]">
                <p className="text-[13px] font-medium text-[#101828]">No Eligible Matches Located</p>
                <p className="text-[12px] mt-1">{caseRecord.matchResults?.unmatchedReason || "Mandatory criteria could not be satisfied."}</p>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {/* Candidate Selector Cards */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {shortlist.map((candidate) => {
                    const isSelected = activeCandidate?.caregiverId === candidate.caregiverId;
                    return (
                      <button
                        key={candidate.caregiverId}
                        type="button"
                        onClick={() => setSelectedCandidateId(candidate.caregiverId)}
                        className={`flex-1 min-w-[180px] rounded-lg border p-3 text-left transition-all ${
                          isSelected
                            ? "border-[#007AFF] bg-[#007AFF]/5 ring-2 ring-[#007AFF]/10 shadow-xs"
                            : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#101828] text-[10px] font-bold text-white">
                            #{candidate.rank}
                          </span>
                          <span className="text-[14px] font-bold text-[#007AFF]">
                            {candidate.overallScore}%
                          </span>
                        </div>
                        <div className="mt-1 font-semibold text-[13px] text-[#101828] truncate">
                          {candidate.name}
                        </div>
                        <div className="text-[11px] text-[#667085]">
                          {candidate.commute.distanceMiles} mi &bull; {candidate.commute.driveTimeMinutes} min
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Active Candidate Detailed Breakdown */}
                {activeCandidate && (
                  <div className="rounded-lg border border-[#EAECF0] bg-white p-4 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-[15px] font-semibold text-[#101828]">
                          {activeCandidate.name}
                        </h3>
                        <p className="text-[12px] text-[#667085]">
                          {activeCandidate.discipline} &bull; Home Territory: ZIP {activeCandidate.commute.originZip}
                        </p>
                      </div>
                      <span className="text-[12px] font-medium text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded">
                        Voice Screening: {activeCandidate.voiceScreeningScore}/5.0
                      </span>
                    </div>

                    <div className="mt-3 border-t border-[#EAECF0] pt-2.5">
                      <span className="text-[11px] font-medium text-[#667085] uppercase tracking-wider block mb-1">
                        Active Certifications
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeCandidate.certifications.map((cert) => (
                          <span key={cert} className="rounded bg-[#F2F4F7] px-2 py-0.5 text-[11px] text-[#344054]">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 rounded bg-[#F8FAFC] p-2.5 text-[12px] text-[#475467] border border-[#EAECF0]">
                      <span className="block font-medium text-[#101828] mb-0.5">Matching Rationale:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                        {activeCandidate.matchRationale.map((rationale, rIdx) => (
                          <li key={rIdx}>{rationale}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* SECTION C: Human Validation */}
          <section className="border-t border-[#EAECF0] pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] block mb-3">
              Section C &bull; Human Validation Controls
            </span>

            {caseRecord.status === "Validated" && caseRecord.validationDecision ? (
              <div className="rounded-xl border border-[#34C759]/30 bg-[#34C759]/10 p-4">
                <span className="text-[13px] font-semibold text-[#248A3D] flex items-center gap-1.5">
                  ✓ Validated by {caseRecord.validationDecision.validatedBy}
                </span>
                <p className="text-[13px] text-[#101828] mt-1">
                  Assigned Caregiver: <strong>{caseRecord.validationDecision.selectedCaregiverName}</strong>
                </p>
                <p className="text-[12px] text-[#475467] mt-0.5">
                  Notes: {caseRecord.validationDecision.validationNotes}
                </p>
                <span className="text-[11px] text-[#667085] block mt-2">
                  Signed off at {caseRecord.validationDecision.validatedAt}
                </span>
              </div>
            ) : activeCandidate ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#475467]">
                    Selected Candidate: <strong>{activeCandidate.name}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFlagging((prev) => !prev)}
                      className="text-[11px] font-medium text-[#F79009] hover:underline"
                    >
                      Flag for Verification
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRejecting((prev) => !prev)}
                      className="text-[11px] font-medium text-[#FF3B30] hover:underline"
                    >
                      Reject Candidate
                    </button>
                  </div>
                </div>

                {isFlagging && (
                  <div className="rounded-lg bg-[#F79009]/5 border border-[#F79009]/20 p-2.5">
                    <input
                      type="text"
                      value={flagNote}
                      onChange={(e) => setFlagNote(e.target.value)}
                      placeholder="Verification note (e.g. check background check status)..."
                      className="w-full rounded border border-[#D0D5DD] bg-white p-1.5 text-[12px]"
                    />
                  </div>
                )}

                {isRejecting && (
                  <div className="rounded-lg bg-[#FF3B30]/5 border border-[#FF3B30]/20 p-2.5">
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Reason for rejecting candidate..."
                      className="w-full rounded border border-[#D0D5DD] bg-white p-1.5 text-[12px]"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onReject(caseRecord.id, activeCandidate.caregiverId, rejectionReason)}
                        className="rounded bg-[#FF3B30] px-2.5 py-1 text-[11px] font-medium text-white"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}

                <textarea
                  rows={2}
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder="Optional validation sign-off notes..."
                  className="w-full rounded-lg border border-[#D0D5DD] p-2 text-[12px] focus:border-[#007AFF] focus:outline-none"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onValidate(caseRecord.id, activeCandidate, validationNotes)}
                    className="rounded-lg bg-[#34C759] px-4 py-2 text-[13px] font-semibold text-white shadow-xs hover:bg-[#2EB04E] transition-colors"
                  >
                    Validate Caregiver Match &rarr;
                  </button>
                </div>
              </div>
            ) : null}
          </section>

        </div>

      </div>
    </div>
  );
}