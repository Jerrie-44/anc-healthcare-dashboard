// components/cases-intake/match-engine-canvas.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaseIntakeRecord, RankedCaregiverMatch } from "@/types/cases-intake";

interface Props {
  caseRecord: CaseIntakeRecord;
  onSelectCandidate: (candidate: RankedCaregiverMatch) => void;
  selectedCandidateId?: string;
}

type NarrativeStep = "ingesting" | "hard_rules" | "commute" | "shortlist";

export function MatchEngineCanvas({ caseRecord, onSelectCandidate, selectedCandidateId }: Props) {
  const [step, setStep] = useState<NarrativeStep>("ingesting");

  useEffect(() => {
    setStep("ingesting");
    const t1 = setTimeout(() => setStep("hard_rules"), 600);
    const t2 = setTimeout(() => setStep("commute"), 1300);
    const t3 = setTimeout(() => setStep("shortlist"), 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [caseRecord.id]);

  const shortlist = caseRecord.matchResults?.shortlist || [];

  return (
    <div className="rounded-xl border border-[#D0D5DD] bg-white p-5 shadow-xs overflow-hidden">
      {/* Storytelling Progress Header */}
      <div className="flex flex-col gap-2 border-b border-[#EAECF0] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
            Match Engine Diagnostics &bull; {caseRecord.id}
          </span>
          <h3 className="text-[16px] font-semibold text-[#101828]">
            Automated Evaluation Pipeline
          </h3>
        </div>

        {/* Visual Workflow Steps */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className={`px-2 py-0.5 rounded transition-colors ${step === "ingesting" ? "bg-[#007AFF] text-white font-semibold" : "bg-[#F2F4F7] text-[#667085]"}`}>
            1. Structured Input
          </span>
          <span className="text-[#98A2B3]">&rarr;</span>
          <span className={`px-2 py-0.5 rounded transition-colors ${step === "hard_rules" ? "bg-[#007AFF] text-white font-semibold" : "bg-[#F2F4F7] text-[#667085]"}`}>
            2. Hard Rules Gate
          </span>
          <span className="text-[#98A2B3]">&rarr;</span>
          <span className={`px-2 py-0.5 rounded transition-colors ${step === "commute" ? "bg-[#007AFF] text-white font-semibold" : "bg-[#F2F4F7] text-[#667085]"}`}>
            3. Azure Maps Commute
          </span>
          <span className="text-[#98A2B3]">&rarr;</span>
          <span className={`px-2 py-0.5 rounded transition-colors ${step === "shortlist" ? "bg-[#34C759] text-white font-semibold" : "bg-[#F2F4F7] text-[#667085]"}`}>
            4. Ranked Shortlist
          </span>
        </div>
      </div>

      {/* Narrative Body */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* Left: Fixed Requirement Node */}
        <div className="md:col-span-4 rounded-lg border border-[#EAECF0] bg-[#F8FAFC] p-4 text-[13px]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
            Requirement Profile
          </span>
          <h4 className="mt-1 font-semibold text-[#101828] text-[15px]">
            {caseRecord.patientName}
          </h4>
          <p className="text-[12px] text-[#475467] mt-0.5">{caseRecord.clinicalDirectives}</p>

          <div className="mt-3 space-y-2 border-t border-[#EAECF0] pt-3 text-[12px]">
            <div className="flex justify-between">
              <span className="text-[#667085]">Discipline:</span>
              <strong className="text-[#101828]">{caseRecord.disciplineNeeded}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Target ZIP:</span>
              <strong className="font-mono text-[#101828]">{caseRecord.zipCode || "Missing"}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Smoke Restriction:</span>
              <strong className={caseRecord.nonSmokingHousehold ? "text-[#007AFF]" : "text-[#475467]"}>
                {caseRecord.nonSmokingHousehold ? "Strict Non-Smoker" : "No Restriction"}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Hours / Week:</span>
              <strong className="text-[#101828]">{caseRecord.hoursPerWeek} hrs</strong>
            </div>
          </div>
        </div>

        {/* Right: Dynamic Shortlist Progression */}
        <div className="md:col-span-8 space-y-3">
          {shortlist.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#D0D5DD] p-8 text-center text-[#667085]">
              <p className="text-[14px] font-medium text-[#101828]">No Eligible Candidates Located</p>
              <p className="text-[12px] mt-1">{caseRecord.matchResults?.unmatchedReason || "Hard-rule filters prevented assignment."}</p>
            </div>
          ) : (
            <AnimatePresence>
              {shortlist.map((candidate, idx) => {
                const isSelected = selectedCandidateId === candidate.caregiverId;
                const isTopRanked = candidate.rank === 1;

                return (
                  <motion.div
                    key={candidate.caregiverId}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.1 }}
                    onClick={() => onSelectCandidate(candidate)}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      isSelected
                        ? "border-[#007AFF] bg-white ring-2 ring-[#007AFF]/15 shadow-xs"
                        : isTopRanked
                        ? "border-[#007AFF]/50 bg-white hover:border-[#007AFF]"
                        : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#101828] text-[11px] font-bold text-white">
                            #{candidate.rank}
                          </span>
                          <span className="font-semibold text-[#101828] text-[15px]">{candidate.name}</span>
                          <span className="text-[12px] text-[#667085] font-mono">({candidate.commute.originZip})</span>
                        </div>

                        {/* Staggered Diagnostics Evidence */}
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                          <span className="rounded bg-[#34C759]/10 px-2 py-0.5 font-medium text-[#248A3D]">
                            ✓ Passed All Hard Rules
                          </span>
                          {(step === "commute" || step === "shortlist") && (
                            <span className="rounded bg-[#F2F4F7] px-2 py-0.5 text-[#344054]">
                              {candidate.commute.distanceMiles} mi &bull; ~{candidate.commute.driveTimeMinutes} min drive
                            </span>
                          )}
                          {step === "shortlist" && (
                            <span className="rounded bg-[#007AFF]/10 px-2 py-0.5 font-medium text-[#007AFF]">
                              Voice AI: {candidate.voiceScreeningScore}/5.0
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[20px] font-bold text-[#007AFF]">{candidate.overallScore}%</span>
                        <span className="block text-[10px] uppercase tracking-wider text-[#667085]">Match Score</span>
                      </div>
                    </div>

                    {/* Explanations */}
                    <div className="mt-3 rounded-md bg-[#F8FAFC] p-2.5 text-[12px] text-[#475467] border border-[#EAECF0]">
                      <span className="block font-medium text-[#101828] mb-0.5">Recommendation Evidence:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                        {candidate.matchRationale.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}