// components/application/cases-intake/ai-review-animation.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  fileName: string;
  onComplete: () => void;
}

const REVIEW_STEPS = [
  { title: "Uploading referral document", desc: "Receiving secure government referral CSV payload" },
  { title: "Reading and analysing CSV data", desc: "Parsing row structures, headers, and encoding" },
  { title: "Extracting individual patient records", desc: "Disaggregating patient roster into independent cases" },
  { title: "Identifying care requirements", desc: "Extracting clinical disciplines, hours per week, and shift windows" },
  { title: "Collating patient information", desc: "Structuring demographic profiles and primary diagnoses" },
  { title: "Checking required qualifications and care preferences", desc: "Evaluating household smoking preferences and licensure needs" },
  { title: "Verifying extracted information", desc: "Auditing required geographic ZIP codes and mandatory fields" },
  { title: "Preparing structured cases", desc: "Generating case records and confirming matching eligibility" },
];

const STAGE_DURATION_MS = 2800; // ~3 seconds per stage

export function AIReviewAnimation({ fileName, onComplete }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (currentStepIndex < REVIEW_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, STAGE_DURATION_MS);
      return () => clearTimeout(timer);
    } else {
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(finishTimer);
    }
  }, [currentStepIndex, onComplete]);

  const activeIndex = Math.min(currentStepIndex, REVIEW_STEPS.length - 1);
  const progressPercent = Math.min(
    100,
    Math.round(((currentStepIndex + 1) / REVIEW_STEPS.length) * 100)
  );

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[#EAECF0] bg-white p-8 shadow-xs">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF]">
          <svg className="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="mt-3 text-[22px] font-semibold text-[#101828]">
          Reviewing your referral
        </h2>
        <p className="mt-1 text-[13px] text-[#475467]">
          ANC AI is extracting patient information, organising care requirements and checking the referral data from <span className="font-mono font-medium text-[#101828]">{fileName}</span>.
        </p>
      </div>

      {/* Prominent Active Stage Display */}
      <div className="mt-6 rounded-xl border border-[#007AFF]/20 bg-[#007AFF]/5 p-4 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#007AFF] block mb-1">
          Stage {activeIndex + 1} of {REVIEW_STEPS.length}
        </span>
        <h3 className="text-[15px] font-semibold text-[#101828]">
          {REVIEW_STEPS[activeIndex].title}
        </h3>
        <p className="text-[12px] text-[#475467] mt-0.5">
          {REVIEW_STEPS[activeIndex].desc}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-[12px] font-medium text-[#667085] mb-1.5">
          <span>Overall Collation Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#EAECF0] overflow-hidden">
          <motion.div
            className="h-full bg-[#007AFF]"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ ease: "linear", duration: 0.4 }}
          />
        </div>
      </div>

      {/* Step Sequence Checklist */}
      <div className="mt-6 space-y-2 rounded-xl border border-[#EAECF0] bg-[#F8FAFC] p-4 text-[13px]">
        {REVIEW_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div key={step.title} className="flex items-center justify-between">
              <span className={`flex items-center gap-2.5 ${isDone ? "text-[#101828] font-medium" : isCurrent ? "text-[#007AFF] font-semibold" : "text-[#98A2B3]"}`}>
                {isDone ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#34C759] text-[10px] text-white">✓</span>
                ) : isCurrent ? (
                  <span className="h-2 w-2 rounded-full bg-[#007AFF] animate-ping" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-[#D0D5DD]" />
                )}
                {step.title}
              </span>
              <span className="text-[11px] font-mono text-[#667085]">
                {isDone ? "Verified" : isCurrent ? "~3s" : "Queued"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Skip/Fast-forward Action */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onComplete}
          className="text-[12px] text-[#667085] hover:text-[#007AFF] hover:underline"
        >
          Fast-forward to extracted patients &rarr;
        </button>
      </div>
    </div>
  );
}