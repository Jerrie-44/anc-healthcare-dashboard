// components/matchmaking/matching-canvas.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CareRequirement, MatchCandidate } from "@/types/anc-core";

interface Props {
  requirement: CareRequirement;
  candidates: MatchCandidate[];
  onValidationSelect: (candidate: MatchCandidate) => void;
}

type AnimationStep = "input_lock" | "hard_rules" | "commute_calc" | "ranked_shortlist";

export function MatchingCanvas({ requirement, candidates, onValidationSelect }: Props) {
  const [step, setStep] = useState<AnimationStep>("input_lock");

  useEffect(() => {
    const t1 = setTimeout(() => setStep("hard_rules"), 1200);
    const t2 = setTimeout(() => setStep("commute_calc"), 2600);
    const t3 = setTimeout(() => setStep("ranked_shortlist"), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [requirement.id]);

  return (
    <div className="relative min-h-[560px] rounded-xl border border-[#D0D5DD] bg-white p-6 shadow-xs overflow-hidden">
      {/* Visual Narrative Indicator Header */}
      <div className="mb-6 flex items-center justify-between border-b border-[#D0D5DD] pb-4">
        <div>
          <span className="text-[12px] font-medium uppercase tracking-wider text-[#667085]">
            Match Engine Diagnostics
          </span>
          <h2 className="text-[18px] font-semibold text-[#101828]">
            Evaluating Pool for {requirement.id} ({requirement.requiredDiscipline})
          </h2>
        </div>

        <div className="flex items-center gap-2 text-[12px] font-mono">
          <span className={`px-2 py-0.5 rounded ${step === "input_lock" ? "bg-[#007AFF] text-white" : "bg-[#F2F4F7] text-[#667085]"}`}>
            1. Input Parse
          </span>
          &rarr;
          <span className={`px-2 py-0.5 rounded ${step === "hard_rules" ? "bg-[#007AFF] text-white" : "bg-[#F2F4F7] text-[#667085]"}`}>
            2. Hard Rules Gate
          </span>
          &rarr;
          <span className={`px-2 py-0.5 rounded ${step === "commute_calc" ? "bg-[#007AFF] text-white" : "bg-[#F2F4F7] text-[#667085]"}`}>
            3. Azure Maps Commute
          </span>
          &rarr;
          <span className={`px-2 py-0.5 rounded ${step === "ranked_shortlist" ? "bg-[#34C759] text-white" : "bg-[#F2F4F7] text-[#667085]"}`}>
            4. Shortlist Ranked
          </span>
        </div>
      </div>

      {/* Main Narrative Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Fixed Requirement Node */}
        <div className="rounded-lg border border-[#D0D5DD] bg-[#F2F4F7] p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">Target Demand</span>
          <p className="mt-1 font-semibold text-[#101828]">{requirement.requiredDiscipline}</p>
          <div className="mt-3 space-y-1.5 text-[13px] text-[#344054]">
            <p>&bull; Territory ZIP: <span className="font-mono">{requirement.zipCode}</span></p>
            <p>&bull; Smoke-free home: <span className="font-mono">{requirement.nonSmokingHouseholdRequired ? "Yes (Strict)" : "No"}</span></p>
            <p>&bull; Intensity: <span className="font-mono">{requirement.scheduleHoursPerWeek} hrs/wk</span></p>
          </div>
        </div>

        {/* Center / Right: Dynamic Animated Candidates */}
        <div className="md:col-span-2 space-y-3">
          <AnimatePresence>
            {candidates.map((candidate, idx) => {
              const failedHardRule = candidate.hardRules.find((r) => !r.passed);
              const isShortlistVisible = step === "ranked_shortlist";

              return (
                <motion.div
                  key={candidate.caregiverId}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ 
                    opacity: failedHardRule && step !== "input_lock" ? 0.35 : 1,
                    y: 0,
                    scale: isShortlistVisible && candidate.rank === 1 ? 1.01 : 1
                  }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  className={`rounded-lg border p-4 transition-all ${
                    failedHardRule && step !== "input_lock"
                      ? "border-dashed border-[#D0D5DD] bg-[#F2F4F7]"
                      : isShortlistVisible && candidate.rank === 1
                      ? "border-[#007AFF] bg-white ring-2 ring-[#007AFF]/10 shadow-xs"
                      : "border-[#D0D5DD] bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {isShortlistVisible && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#101828] text-[11px] font-bold text-white">
                            #{candidate.rank}
                          </span>
                        )}
                        <span className="font-medium text-[#101828]">{candidate.caregiver.name}</span>
                        <span className="font-mono text-[12px] text-[#667085]">({candidate.caregiver.zipCode})</span>
                      </div>

                      {/* Progressive Status Reveal */}
                      <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
                        {step !== "input_lock" && (
                          <span className={`px-2 py-0.5 rounded font-medium ${failedHardRule ? "bg-[#FF3B30]/10 text-[#FF3B30]" : "bg-[#34C759]/10 text-[#34C759]"}`}>
                            {failedHardRule ? `Failed: ${failedHardRule.label}` : "Passed All Hard Rules"}
                          </span>
                        )}

                        {(step === "commute_calc" || step === "ranked_shortlist") && !failedHardRule && (
                          <span className="bg-[#F2F4F7] px-2 py-0.5 rounded text-[#344054]">
                            {candidate.commute.distanceMiles} mi &bull; ~{candidate.commute.estimatedDriveMinutes} min drive
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score / Action */}
                    <div className="text-right">
                      {isShortlistVisible && !failedHardRule ? (
                        <div>
                          <span className="text-[20px] font-bold text-[#007AFF]">
                            {candidate.overallScore}%
                          </span>
                          <span className="block text-[11px] text-[#667085]">Suitability</span>
                          <button
                            type="button"
                            onClick={() => onValidationSelect(candidate)}
                            className="mt-2 rounded bg-[#007AFF] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#0062cc]"
                          >
                            Inspect &amp; Validate &rarr;
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}