// app/(dashboard)/post-matchmaking/[caseId]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  getPostMatchCaseById,
  PostMatchCaseView,
  validateCasePairing,
  updateCasePostMatchStatus,
} from "@/lib/post-matchmaking-service";

interface PageProps {
  params: Promise<{ caseId: string }>;
}

export default function PostMatchCaseDetailPage({ params }: PageProps) {
  const { caseId } = use(params);
  const [isMounted, setIsMounted] = useState(false);
  const [caseView, setCaseView] = useState<PostMatchCaseView | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Selection & Confirmation Modal State
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [confirmAction, setConfirmAction] = useState<
    "validate" | "flag" | "unmatched" | null
  >(null);
  const [actionNotes, setActionNotes] = useState("");

  const refreshCase = () => {
    const found = getPostMatchCaseById(caseId);
    setCaseView(found);
    if (found) {
      const eligible = (found.raw.matchResults?.shortlist || []).filter(
        (c) => c.allHardRulesPassed
      );
      if (eligible.length > 0 && !selectedCandidateId) {
        setSelectedCandidateId(eligible[0].caregiverId);
      }
    }
  };

  useEffect(() => {
    setIsMounted(true);
    refreshCase();
  }, [caseId]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-8 font-sans text-[#101828]">
        <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
          <div className="rounded-xl border border-[#EAECF0] bg-white p-12 text-center text-[#667085]">
            Loading case details...
          </div>
        </main>
      </div>
    );
  }

  if (!caseView) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-8 font-sans text-[#101828]">
        <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
          <Link
            href="/post-matchmaking"
            className="text-[13px] font-medium text-[#007AFF] hover:underline"
          >
            &larr; Back to Post-Matchmaking
          </Link>
          <div className="rounded-xl border border-[#EAECF0] bg-white p-12 text-center">
            <h2 className="text-[20px] font-semibold text-[#101828]">Case Not Found</h2>
            <p className="mt-1 text-[13px] text-[#667085]">
              No matching record found for <strong className="font-mono">{caseId}</strong>.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const shortlist = caseView.raw.matchResults?.shortlist || [];
  const eligibleCandidates = [...shortlist]
    .filter((c) => c.allHardRulesPassed)
    .sort((a, b) => b.overallScore - a.overallScore);
  const ineligibleCandidates = shortlist.filter((c) => !c.allHardRulesPassed);

  const activeCandidate =
    eligibleCandidates.find((c) => c.caregiverId === selectedCandidateId) ||
    eligibleCandidates[0] ||
    null;

  const isTopRecommendation =
    activeCandidate &&
    eligibleCandidates[0] &&
    activeCandidate.caregiverId === eligibleCandidates[0].caregiverId;

  const handleConfirmDecision = () => {
    if (confirmAction === "validate" && activeCandidate) {
      validateCasePairing(
        caseView.id,
        activeCandidate.caregiverId,
        activeCandidate.name,
        actionNotes,
        !isTopRecommendation
      );
      setFeedbackBanner(
        `Pairing validated: ${activeCandidate.name} approved for ${caseView.patientName}.`
      );
    } else if (confirmAction === "flag") {
      updateCasePostMatchStatus(
        caseView.id,
        "Needs Information",
        actionNotes || "Flagged by operator for further clinical/credential verification."
      );
      setFeedbackBanner("Case flagged for further verification.");
    } else if (confirmAction === "unmatched") {
      updateCasePostMatchStatus(
        caseView.id,
        "Unmatched",
        actionNotes || "Marked unmatched by operator."
      );
      setFeedbackBanner("Case status updated to Unmatched.");
    }

    setConfirmAction(null);
    setActionNotes("");
    refreshCase();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-sans text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
        
        {/* Breadcrumb & Back Navigation */}
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
          <div className="flex items-center gap-2 text-[13px] text-[#667085]">
            <Link
              href="/post-matchmaking"
              className="font-medium text-[#344054] hover:text-[#101828]"
            >
              Post-Matchmaking
            </Link>
            <span>/</span>
            <span className="font-mono font-semibold text-[#101828]">
              {caseView.id}
            </span>
          </div>

          <Link
            href="/post-matchmaking"
            className="text-[13px] font-medium text-[#007AFF] hover:underline"
          >
            &larr; Back to Post-Matchmaking
          </Link>
        </div>

        {/* Persistence Feedback */}
        {feedbackBanner && (
          <div className="flex items-center justify-between rounded-lg border border-[#34C759]/30 bg-[#34C759]/10 px-4 py-2.5 text-[13px] font-medium text-[#248A3D]">
            <span>✓ {feedbackBanner}</span>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="hover:underline"
            >
              ✕
            </button>
          </div>
        )}

        {/* A. CASE HEADER */}
        <div className="rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-xs">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[24px] font-semibold tracking-tight text-[#101828]">
                  {caseView.patientName}
                </h1>
                <span className="rounded bg-[#F2F4F7] px-2 py-0.5 font-mono text-[12px] font-medium text-[#475467]">
                  {caseView.id}
                </span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    caseView.status === "Validated"
                      ? "bg-[#34C759]/15 text-[#248A3D]"
                      : caseView.status === "Awaiting Validation"
                      ? "bg-[#007AFF]/10 text-[#007AFF]"
                      : caseView.status === "Unmatched"
                      ? "bg-[#F79009]/15 text-[#B26A00]"
                      : "bg-[#FF3B30]/10 text-[#FF3B30]"
                  }`}
                >
                  {caseView.status}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#475467]">
                <span>
                  <strong className="font-medium text-[#101828]">Requirement:</strong>{" "}
                  {caseView.careRequirement}
                </span>
                <span>&bull;</span>
                <span>
                  <strong className="font-medium text-[#101828]">Location:</strong>{" "}
                  {caseView.location}
                </span>
                <span>&bull;</span>
                <span>
                  <strong className="font-medium text-[#101828]">Date Matched:</strong>{" "}
                  <span className="font-mono">{caseView.dateMatched}</span>
                </span>
              </div>
            </div>

            {/* E. HUMAN VALIDATION ACTION BAR (Only shown when not yet validated) */}
            {caseView.status !== "Validated" && (
              <div className="flex flex-wrap items-center gap-2.5">
                {activeCandidate && (
                  <button
                    type="button"
                    onClick={() => setConfirmAction("validate")}
                    className="rounded-lg bg-[#007AFF] px-4 py-2 text-[13px] font-semibold text-white shadow-xs hover:bg-[#0062CC] transition-colors"
                  >
                    {isTopRecommendation
                      ? "Validate Recommended Caregiver"
                      : "Validate Selected Alternative"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setConfirmAction("flag")}
                  className="rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2 text-[13px] font-medium text-[#344054] hover:bg-[#F2F4F7]"
                >
                  Flag for Further Verification
                </button>

                {caseView.status !== "Unmatched" && (
                  <button
                    type="button"
                    onClick={() => setConfirmAction("unmatched")}
                    className="rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2 text-[13px] font-medium text-[#667085] hover:bg-[#F2F4F7]"
                  >
                    Mark as Unmatched
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* TWO-COLUMN MAIN WORKSPACE */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* LEFT COLUMN (4 cols): B. Patient Requirements & F. Matching History */}
          <div className="space-y-6 lg:col-span-4">
            
            {/* B. Patient Requirements */}
            <div className="rounded-xl border border-[#EAECF0] bg-white p-5 shadow-xs">
              <h3 className="border-b border-[#EAECF0] pb-3 text-[15px] font-semibold text-[#101828]">
                Patient Requirements
              </h3>
              <dl className="mt-4 space-y-3 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-[#667085]">Required Qualification:</dt>
                  <dd className="font-semibold text-[#101828]">{caseView.disciplineNeeded}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#667085]">Weekly Care Hours:</dt>
                  <dd className="font-medium text-[#101828]">{caseView.hoursPerWeek} hrs/wk</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#667085]">Location / ZIP Code:</dt>
                  <dd className="font-mono font-medium text-[#101828]">{caseView.location}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#667085]">Smoking Constraint:</dt>
                  <dd className="font-medium text-[#101828]">{caseView.smokingRequirement}</dd>
                </div>
                <div className="border-t border-[#EAECF0] pt-3">
                  <dt className="text-[#667085] mb-1">Clinical Directives &amp; Constraints:</dt>
                  <dd className="rounded-lg bg-[#F8FAFC] p-3 text-[12px] leading-relaxed text-[#344054] border border-[#EAECF0]">
                    {caseView.clinicalDirectives}
                  </dd>
                </div>
              </dl>
            </div>

            {/* F. Matching and Validation History */}
            <div className="rounded-xl border border-[#EAECF0] bg-white p-5 shadow-xs">
              <h3 className="border-b border-[#EAECF0] pb-3 text-[15px] font-semibold text-[#101828]">
                Matching &amp; Validation History
              </h3>
              <div className="mt-4 space-y-4">
                {caseView.history.map((evt, idx) => (
                  <div key={evt.id} className="relative flex gap-3 text-[12px]">
                    <div className="flex flex-col items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#007AFF] mt-1" />
                      {idx < caseView.history.length - 1 && (
                        <div className="w-[1px] flex-1 bg-[#D0D5DD] my-1" />
                      )}
                    </div>
                    <div className="pb-2">
                      <span className="font-semibold text-[#101828] block">{evt.title}</span>
                      <span className="font-mono text-[11px] text-[#667085] block">
                        {evt.timestamp} &bull; {evt.actor}
                      </span>
                      {evt.details && (
                        <p className="mt-1 text-[#475467] leading-relaxed">{evt.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (8 cols): C. Recommended Caregivers & D. Matching Explanation */}
          <div className="space-y-6 lg:col-span-8">
            
            {/* C. Eligible Recommendations */}
            <div className="rounded-xl border border-[#EAECF0] bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3 mb-4">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#101828]">
                    Recommended Caregivers ({eligibleCandidates.length})
                  </h3>
                  <p className="text-[12px] text-[#667085]">
                    Ranked by Match Engine score. Only candidates passing all mandatory rules are eligible.
                  </p>
                </div>
              </div>

              {eligibleCandidates.length === 0 ? (
                <div className="rounded-xl border border-[#EAECF0] bg-[#F8FAFC] p-8 text-center">
                  <span className="text-[14px] font-semibold text-[#101828] block">
                    No Eligible Caregivers Identified
                  </span>
                  <p className="mt-1 text-[13px] text-[#667085] max-w-md mx-auto">
                    {caseView.status === "Needs Review"
                      ? "This case requires additional patient information or clinical verification before eligible caregivers can be confirmed."
                      : "No active caregivers in the database satisfied all mandatory qualification, availability, and location requirements."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {eligibleCandidates.map((cand, index) => {
                    const isSelected = activeCandidate?.caregiverId === cand.caregiverId;
                    const isValidatedMatch =
                      caseView.status === "Validated" &&
                      caseView.raw.validationDecision?.selectedCaregiverId ===
                        cand.caregiverId;

                    return (
                      <div
                        key={cand.caregiverId}
                        onClick={() => {
                          if (caseView.status !== "Validated") {
                            setSelectedCandidateId(cand.caregiverId);
                          }
                        }}
                        className={`rounded-xl border p-5 transition-all ${
                          isValidatedMatch
                            ? "border-[#D0D5DD] bg-[#F8FAFC]"
                            : isSelected && caseView.status !== "Validated"
                            ? "border-[#007AFF] bg-[#007AFF]/[0.02] cursor-pointer"
                            : "border-[#EAECF0] bg-white hover:border-[#D0D5DD] cursor-pointer"
                        }`}
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded bg-[#F2F4F7] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#344054]">
                                Rank #{index + 1}
                              </span>
                              <Link
                                href={`/caregivers/${encodeURIComponent(cand.caregiverId)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[16px] font-semibold text-[#101828] hover:text-[#007AFF] hover:underline"
                              >
                                {cand.name}
                              </Link>
                              <span className="font-mono text-[12px] text-[#667085]">
                                ({cand.caregiverId})
                              </span>
                              {isValidatedMatch && (
                                <span className="rounded-full bg-[#34C759]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#248A3D]">
                                  ✓ Validated Pairing
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-[13px] text-[#475467]">
                              {cand.discipline} &bull; Origin ZIP {cand.commute?.originZip || "15213"}{" "}
                              {cand.commute
                                ? `(${cand.commute.distanceMiles} mi / ${cand.commute.driveTimeMinutes} min commute)`
                                : ""}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[20px] font-bold font-mono text-[#007AFF] block leading-none">
                                {cand.overallScore}%
                              </span>
                              <span className="text-[10px] uppercase font-semibold text-[#667085]">
                                Match Score
                              </span>
                            </div>

                            {caseView.status !== "Validated" && (
                              <input
                                type="radio"
                                name="selectedCaregiver"
                                checked={isSelected}
                                onChange={() => setSelectedCandidateId(cand.caregiverId)}
                                className="h-4 w-4 accent-[#007AFF]"
                              />
                            )}
                          </div>
                        </div>

                        {/* D. Explainable Matching Breakdown */}
                        <div className="mt-4 border-t border-[#EAECF0] pt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] block mb-1.5">
                              Mandatory Requirement Checks
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {cand.hardRules.map((rule) => (
                                <span
                                  key={rule.id}
                                  className="inline-flex items-center gap-1 rounded bg-[#34C759]/10 px-2 py-0.5 text-[11px] font-medium text-[#248A3D]"
                                >
                                  ✓ {rule.label}: {rule.candidateValue}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] block mb-1.5">
                              Recommendation Rationale
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-[12px] text-[#344054]">
                              {cand.matchRationale.map((reason, rIdx) => (
                                <li key={rIdx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ineligible Candidates (Failed Mandatory Requirements) */}
            {ineligibleCandidates.length > 0 && (
              <div className="rounded-xl border border-[#EAECF0] bg-white p-6 shadow-xs">
                <h3 className="text-[15px] font-semibold text-[#101828]">
                  Excluded Candidates — Failed Mandatory Requirements ({ineligibleCandidates.length})
                </h3>
                <p className="mt-0.5 text-[12px] text-[#667085]">
                  These caregivers are disqualified from pairing due to mandatory constraint mismatches.
                </p>

                <div className="mt-4 space-y-2.5">
                  {ineligibleCandidates.map((cand) => (
                    <div
                      key={cand.caregiverId}
                      className="flex flex-col justify-between gap-2 rounded-lg border border-[#FF3B30]/20 bg-[#FF3B30]/[0.02] p-3.5 sm:flex-row sm:items-center text-[13px]"
                    >
                      <div>
                        <span className="font-semibold text-[#101828]">{cand.name}</span>{" "}
                        <span className="font-mono text-[11px] text-[#667085]">
                          ({cand.caregiverId})
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {cand.hardRules
                            .filter((r) => !r.passed)
                            .map((failed) => (
                              <span
                                key={failed.id}
                                className="rounded bg-[#FF3B30]/10 px-2 py-0.5 text-[11px] font-medium text-[#FF3B30]"
                              >
                                ✕ Failed {failed.label}: Required {failed.requirementValue}, Found{" "}
                                {failed.candidateValue}
                              </span>
                            ))}
                        </div>
                      </div>

                      <span className="text-[11px] font-semibold uppercase text-[#FF3B30]">
                        Ineligible
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* CONFIRMATION MODAL FOR HUMAN VALIDATION DECISIONS */}
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-xl">
              <h3 className="text-[18px] font-semibold text-[#101828]">
                {confirmAction === "validate"
                  ? "Confirm Patient-Caregiver Pairing"
                  : confirmAction === "flag"
                  ? "Flag Case for Further Verification"
                  : "Mark Case as Unmatched"}
              </h3>

              <p className="mt-1.5 text-[13px] text-[#475467]">
                {confirmAction === "validate" && activeCandidate
                  ? `Approve ${activeCandidate.name} (${activeCandidate.caregiverId}) for ${caseView.patientName} (${caseView.id})? Downstream credentialing and deployment sign-off remain separate stages.`
                  : confirmAction === "flag"
                  ? `Move ${caseView.id} to Needs Review status for additional operator verification?`
                  : `Confirm that no eligible caregiver can currently be paired with ${caseView.id}?`}
              </p>

              <div className="mt-4">
                <label className="mb-1 block text-[12px] font-medium text-[#344054]">
                  Operator Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Record rationale or clinical verification notes..."
                  className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[13px] text-[#101828] focus:border-[#007AFF] focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmAction(null);
                    setActionNotes("");
                  }}
                  className="rounded-lg border border-[#D0D5DD] px-4 py-2 text-[13px] font-medium text-[#344054] hover:bg-[#F2F4F7]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDecision}
                  className="rounded-lg bg-[#007AFF] px-4 py-2 text-[13px] font-semibold text-white shadow-xs hover:bg-[#0062CC]"
                >
                  Confirm Decision
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}