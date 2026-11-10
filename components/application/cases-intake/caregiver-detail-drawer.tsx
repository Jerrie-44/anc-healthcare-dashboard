// components/application/cases-intake/caregiver-detail-drawer.tsx
"use client";

import { ExtractedPatientCase, RankedCaregiverMatch } from "@/types/cases-intake";

interface Props {
  isOpen: boolean;
  patientCase: ExtractedPatientCase | null;
  onClose: () => void;
  onSelectAlternative: (patientId: string, candidate: RankedCaregiverMatch) => void;
}

export function CaregiverDetailDrawer({
  isOpen,
  patientCase,
  onClose,
  onSelectAlternative,
}: Props) {
  if (!isOpen || !patientCase) return null;

  const currentCaregiver = patientCase.selectedCaregiver;
  const alternatives = patientCase.alternativeMatches || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/40 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EAECF0] bg-white px-6 py-4">
          <div>
            <h3 className="text-[16px] font-semibold text-[#101828]">Caregiver Pairing Details</h3>
            <span className="text-[12px] text-[#667085] font-mono">{patientCase.id} &bull; {patientCase.patientName}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#667085] hover:bg-[#F2F4F7]"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">
          
          {/* Patient Demand Context */}
          <div className="rounded-xl border border-[#EAECF0] bg-[#F8FAFC] p-4 text-[13px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] block mb-1">
              Patient Care Directives
            </span>
            <p className="text-[#344054]">{patientCase.clinicalDirectives}</p>
            <div className="mt-2.5 flex flex-wrap gap-2 text-[12px]">
              <span className="rounded bg-white px-2 py-0.5 border border-[#EAECF0] text-[#101828] font-medium">
                {patientCase.disciplineNeeded}
              </span>
              <span className="rounded bg-white px-2 py-0.5 border border-[#EAECF0] text-[#344054]">
                ZIP {patientCase.zipCode}
              </span>
              <span className="rounded bg-white px-2 py-0.5 border border-[#EAECF0] text-[#344054]">
                {patientCase.hoursPerWeek} hrs/week
              </span>
            </div>
          </div>

          {/* Primary Recommended Caregiver Profile */}
          {currentCaregiver ? (
            <div className="rounded-xl border border-[#EAECF0] bg-white p-5 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#101828] text-[11px] font-bold text-white">
                      #{currentCaregiver.rank}
                    </span>
                    <h4 className="text-[16px] font-semibold text-[#101828]">{currentCaregiver.name}</h4>
                  </div>
                  <span className="text-[13px] text-[#007AFF] font-medium">{currentCaregiver.discipline}</span>
                </div>
                <div className="text-right">
                  <span className="text-[20px] font-bold text-[#007AFF]">{currentCaregiver.overallScore}%</span>
                  <span className="block text-[10px] uppercase text-[#667085]">Match Score</span>
                </div>
              </div>

              {/* Commute & AI Screening */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-[12px] bg-[#F8FAFC] p-3 rounded-lg border border-[#EAECF0]">
                <div>
                  <span className="text-[#667085] block">Azure Maps Commute:</span>
                  <strong className="text-[#101828]">{currentCaregiver.commute.distanceMiles} mi ({currentCaregiver.commute.driveTimeMinutes} min)</strong>
                </div>
                <div>
                  <span className="text-[#667085] block">AI Voice Communication:</span>
                  <strong className="text-[#007AFF]">{currentCaregiver.voiceScreeningScore}/5.0 Rated</strong>
                </div>
              </div>

              {/* Certifications */}
              <div className="mt-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#667085] block mb-1">
                  Verified Certifications
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentCaregiver.certifications.map((c) => (
                    <span key={c} className="rounded bg-[#F2F4F7] px-2 py-0.5 text-[11px] text-[#344054]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reasons for Recommendation */}
              <div className="mt-3.5 rounded-md bg-[#F8FAFC] p-3 text-[12px] border border-[#EAECF0]">
                <strong className="text-[#101828] block mb-1">Recommendation Reasons:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-[#475467]">
                  {currentCaregiver.matchRationale.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#D0D5DD] p-6 text-center text-[#667085]">
              <span className="text-[14px] font-medium text-[#101828] block">No Recommendation Available</span>
              <span className="text-[12px] mt-1 block">{patientCase.unmatchedReason || "Mandatory requirements were not satisfied."}</span>
            </div>
          )}

          {/* Alternative Candidates */}
          {alternatives.length > 0 && (
            <div>
              <span className="text-[12px] font-semibold text-[#101828] uppercase tracking-wider block mb-2">
                Alternative Shortlist Candidates
              </span>
              <div className="space-y-2">
              {alternatives.map((alt: RankedCaregiverMatch) => (
                  <div key={alt.caregiverId} className="flex items-center justify-between rounded-lg border border-[#EAECF0] p-3 hover:bg-[#F8FAFC]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[13px] text-[#101828]">{alt.name}</span>
                        <span className="font-mono text-[11px] text-[#007AFF]">({alt.overallScore}%)</span>
                      </div>
                      <span className="text-[11px] text-[#667085]">{alt.commute.distanceMiles} mi away &bull; Voice {alt.voiceScreeningScore}/5.0</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectAlternative(patientCase.id, alt)}
                      className="rounded border border-[#D0D5DD] bg-white px-2.5 py-1 text-[11px] font-medium text-[#101828] hover:bg-[#F2F4F7]"
                    >
                      Select as Match
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}