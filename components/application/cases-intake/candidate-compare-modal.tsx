// components/cases-intake/candidate-compare-modal.tsx
"use client";

import { CaseIntakeRecord, RankedCaregiverMatch } from "@/types/cases-intake";

interface Props {
  caseRecord: CaseIntakeRecord;
  candidates: RankedCaregiverMatch[];
  isOpen: boolean;
  onClose: () => void;
  onValidateCandidate: (candidate: RankedCaregiverMatch) => void;
}

export function CandidateCompareModal({ caseRecord, candidates, isOpen, onClose, onValidateCandidate }: Props) {
  if (!isOpen || candidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-[#EAECF0] bg-white p-6 shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
          <div>
            <h2 className="text-[18px] font-semibold text-[#101828]">
              Candidate Comparison &bull; {caseRecord.patientName}
            </h2>
            <p className="text-[13px] text-[#667085]">
              Side-by-side inspection of top-ranked caregivers against requirement criteria.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828]"
          >
            ✕
          </button>
        </div>

        {/* Matrix Comparison Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#EAECF0]">
                <th className="py-2.5 pr-4 text-[#667085] font-medium w-1/4">Evaluation Metric</th>
                {candidates.slice(0, 3).map((candidate) => (
                  <th key={candidate.caregiverId} className="py-2.5 px-3 text-[#101828] font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#101828] text-[10px] font-bold text-white">
                        #{candidate.rank}
                      </span>
                      <span>{candidate.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0] text-[13px]">
              <tr>
                <td className="py-3 pr-4 text-[#667085]">Overall Match Score</td>
                {candidates.slice(0, 3).map((c) => (
                  <td key={c.caregiverId} className="py-3 px-3">
                    <span className="text-[16px] font-bold text-[#007AFF]">{c.overallScore}%</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#667085]">Discipline &amp; Licensure</td>
                {candidates.slice(0, 3).map((c) => (
                  <td key={c.caregiverId} className="py-3 px-3 font-medium text-[#101828]">
                    {c.discipline}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#667085]">Commute via Azure Maps</td>
                {candidates.slice(0, 3).map((c) => (
                  <td key={c.caregiverId} className="py-3 px-3 text-[#344054]">
                    {c.commute.distanceMiles} mi ({c.commute.driveTimeMinutes} min)
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#667085]">AI Voice Screening Aptitude</td>
                {candidates.slice(0, 3).map((c) => (
                  <td key={c.caregiverId} className="py-3 px-3 font-semibold text-[#007AFF]">
                    {c.voiceScreeningScore} / 5.0
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#667085]">Active Certifications</td>
                {candidates.slice(0, 3).map((c) => (
                  <td key={c.caregiverId} className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {c.certifications.map((cert) => (
                        <span key={cert} className="rounded bg-[#F2F4F7] px-1.5 py-0.5 text-[11px] text-[#344054]">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#667085]">Action</td>
                {candidates.slice(0, 3).map((c) => (
                  <td key={c.caregiverId} className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => {
                        onValidateCandidate(c);
                        onClose();
                      }}
                      className="rounded bg-[#34C759] px-3 py-1.5 text-[12px] font-medium text-white shadow-xs hover:bg-[#2EB04E]"
                    >
                      Validate Match &rarr;
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}