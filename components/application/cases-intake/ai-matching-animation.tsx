// components/application/cases-intake/ai-matching-animation.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExtractedPatientCase } from "@/types/cases-intake";

interface Props {
  patients: ExtractedPatientCase[];
  onComplete: () => void;
}

const MATCHING_STAGES = [
  { title: "Loading patient care requirements", desc: "Disaggregating extracted care orders, schedules, and clinical directivities" },
  { title: "Searching the caregiver database", desc: "Querying active caregiver pool from Care Givers directory" },
  { title: "Evaluating mandatory care requirements", desc: "Applying hard-rule filters: smoking restrictions and licensure requirements" },
  { title: "Checking caregiver qualifications", desc: "Auditing clinical certifications (WCC, BLS, ACLS, CNA)" },
  { title: "Evaluating location and commute suitability", desc: "Calculating Azure Maps travel times and 20-mile operational perimeters" },
  { title: "Comparing caregiver availability", desc: "Verifying current caseload bandwidth against patient hours per week" },
  { title: "Generating recommended patient-caregiver pairs", desc: "Computing suitability scores and establishing ranked pair associations" },
  { title: "Completing matching", desc: "Shortlist assembled and formatted for operator human validation" },
];

const STAGE_DURATION_MS = 2800; // ~3 seconds per stage

export function AIMatchingAnimation({ patients, onComplete }: Props) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (stageIndex < MATCHING_STAGES.length - 1) {
      const timer = setTimeout(() => {
        setStageIndex((prev) => prev + 1);
      }, STAGE_DURATION_MS);
      return () => clearTimeout(timer);
    } else {
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(finishTimer);
    }
  }, [stageIndex, onComplete]);

  const activeStage = MATCHING_STAGES[stageIndex];
  const progressPercent = Math.min(
    100,
    Math.round(((stageIndex + 1) / MATCHING_STAGES.length) * 100)
  );

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[#EAECF0] bg-white p-8 shadow-xs">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF]">
          <svg className="h-6 w-6 animate-spin text-[#007AFF]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <h2 className="mt-3 text-[22px] font-semibold text-[#101828]">
          Pairing Caregivers with Patients
        </h2>
        <p className="mt-1 text-[13px] text-[#475467]">
          Evaluating {patients.length} care requirements against active profiles in the Care Givers database.
        </p>
      </div>

      {/* Prominent Active Stage Display */}
      <div className="mt-6 rounded-xl border border-[#007AFF]/20 bg-[#007AFF]/5 p-4 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#007AFF] block mb-1">
          Stage {stageIndex + 1} of {MATCHING_STAGES.length}
        </span>
        <h3 className="text-[15px] font-semibold text-[#101828]">
          {activeStage.title}...
        </h3>
        <p className="text-[12px] text-[#475467] mt-0.5">
          {activeStage.desc}
        </p>
      </div>

      {/* Progress Bars Indicator */}
      <div className="mt-6 grid grid-cols-8 gap-1.5">
        {MATCHING_STAGES.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-colors ${
              idx <= stageIndex ? "bg-[#007AFF]" : "bg-[#EAECF0]"
            }`}
          />
        ))}
      </div>

      {/* Animated Mini Grid of Evaluated Patients */}
      <div className="mt-6 border-t border-[#EAECF0] pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
            Live Candidate Audit Pipeline
          </span>
          <span className="text-[11px] font-mono text-[#667085]">
            Progress: {progressPercent}%
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
          {patients.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between rounded-lg border border-[#EAECF0] bg-[#F8FAFC] p-2.5"
            >
              <div className="truncate pr-2">
                <span className="font-medium text-[#101828] block truncate">{p.patientName}</span>
                <span className="text-[11px] text-[#667085]">{p.disciplineNeeded} &bull; ZIP {p.zipCode || "Missing"}</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                stageIndex >= 6 
                  ? "bg-[#34C759]/10 border-[#34C759]/30 text-[#248A3D] font-medium" 
                  : "bg-white border-[#D0D5DD] text-[#344054]"
              }`}>
                {stageIndex >= 6 ? "Paired" : "Evaluating"}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Skip/Fast-forward Action */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onComplete}
          className="text-[12px] text-[#667085] hover:text-[#007AFF] hover:underline"
        >
          Fast-forward to results &rarr;
        </button>
      </div>
    </div>
  );
}