// components/application/cases-intake/validation-process-screen.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExtractedPatientCase } from "@/types/cases-intake";

interface Props {
  patients: ExtractedPatientCase[];
  onValidationSuccess: (validatedCases: ExtractedPatientCase[]) => void;
  onCancelOrRetry: () => void;
}

type StageType = "confirming_records" | "confirming_assignments" | "saving_decisions" | "finalising" | "complete" | "error";

export function ValidationProcessScreen({ patients, onValidationSuccess, onCancelOrRetry }: Props) {
  const [currentStage, setCurrentStage] = useState<StageType>("confirming_records");
  const [confirmedPairingIds, setConfirmedPairingIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter eligible selected pairings
  const eligiblePairings = useMemo(() => {
    return patients.filter((p) => p.selectionStatus === "Match Selected" && p.selectedCaregiver);
  }, [patients]);

  const unresolvedPatients = useMemo(() => {
    return patients.filter((p) => p.selectionStatus !== "Match Selected" || !p.selectedCaregiver);
  }, [patients]);

  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;
    let t3: NodeJS.Timeout;
    let t4: NodeJS.Timeout;
    let tRedirect: NodeJS.Timeout;

    // Stage 1 -> 2
    t1 = setTimeout(() => {
      setCurrentStage("confirming_assignments");

      // Progressively confirm pairings
      eligiblePairings.forEach((p, index) => {
        setTimeout(() => {
          setConfirmedPairingIds((prev) => [...prev, p.id]);
        }, (index + 1) * 450);
      });
    }, 2400);

    // Stage 2 -> 3
    t2 = setTimeout(() => {
      setCurrentStage("saving_decisions");
    }, 4800);

    // Stage 3 -> 4
    t3 = setTimeout(() => {
      setCurrentStage("finalising");
    }, 7200);

    // Stage 4 -> Complete
    t4 = setTimeout(() => {
      setCurrentStage("complete");

      // Prepare validated case records
      const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
      const updatedCases: ExtractedPatientCase[] = patients.map((p) => {
        if (p.selectionStatus === "Match Selected" && p.selectedCaregiver) {
          return {
            ...p,
            matchingStatus: "Validated",
            validatedAt: timestamp,
            validatedBy: "Dispatcher Intake Desk",
            validationNotes: "Human validated via Two-Panel Selection Workspace.",
          };
        }
        return p;
      });

      // Stage 4 Success State displays for 2 seconds before redirecting
      tRedirect = setTimeout(() => {
        onValidationSuccess(updatedCases);
      }, 2000);
    }, 9400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tRedirect);
    };
  }, [eligiblePairings, onValidationSuccess, patients]);

  const progressPercent = {
    confirming_records: 25,
    confirming_assignments: 55,
    saving_decisions: 80,
    finalising: 95,
    complete: 100,
    error: 0,
  }[currentStage];

  return (
    <div className="mx-auto w-full max-w-3xl py-6 font-sans">
      <div className="rounded-2xl border border-[#EAECF0] bg-white p-8 shadow-sm">
        
        {/* Error State */}
        {currentStage === "error" ? (
          <div className="text-center py-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FF3B30]/10 text-[#FF3B30] mb-4">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-[20px] font-semibold text-[#101828]">Validation Operation Interrupted</h2>
            <p className="mt-1 text-[13px] text-[#475467]">{errorMessage || "A backend persistence error occurred while saving matches."}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={onCancelOrRetry}
                className="rounded-lg border border-[#D0D5DD] bg-white px-4 py-2 text-[13px] font-medium text-[#344054] hover:bg-[#F2F4F7]"
              >
                Return to Matching Workspace
              </button>
            </div>
          </div>
        ) : currentStage === "complete" ? (
          /* Success Confirmation State (~2s display before automatic redirect) */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#34C759]/15 text-[#34C759] mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-[24px] font-semibold text-[#101828]">
              All Matches Successfully Validated
            </h2>
            <p className="mt-1 text-[14px] text-[#475467]">
              Your selected caregiver pairings have been confirmed and the patient case records have been updated.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="rounded-lg border border-[#EAECF0] bg-[#F8FAFC] p-3 text-center">
                <span className="text-[11px] uppercase font-bold text-[#667085] block">Total Processed</span>
                <span className="text-[18px] font-bold text-[#101828]">{patients.length}</span>
              </div>
              <div className="rounded-lg border border-[#34C759]/30 bg-[#34C759]/10 p-3 text-center">
                <span className="text-[11px] uppercase font-bold text-[#248A3D] block">Validated</span>
                <span className="text-[18px] font-bold text-[#248A3D]">{eligiblePairings.length}</span>
              </div>
              <div className="rounded-lg border border-[#EAECF0] bg-[#F8FAFC] p-3 text-center">
                <span className="text-[11px] uppercase font-bold text-[#FF3B30] block">Unresolved</span>
                <span className="text-[18px] font-bold text-[#FF3B30]">{unresolvedPatients.length}</span>
              </div>
            </div>

            <p className="mt-6 text-[12px] text-[#667085] animate-pulse">
              Redirecting to Cases Overview...
            </p>
          </motion.div>
        ) : (
          /* 4-Stage Progressive Animation Sequence */
          <div>
            <div className="text-center mb-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF] mb-3">
                <svg className="h-6 w-6 animate-spin text-[#007AFF]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>

              <h2 className="text-[22px] font-semibold text-[#101828]">
                Validating Caregiver Matches
              </h2>
              <p className="mt-1 text-[13px] text-[#475467]">
                ANC is confirming your selected caregiver pairings and updating the patient case records.
              </p>
            </div>

            {/* Current Active Stage Description Box */}
            <div className="rounded-xl border border-[#007AFF]/20 bg-[#007AFF]/5 p-4 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#007AFF] block mb-1">
                {currentStage === "confirming_records" && "Stage 1 of 4: Confirming Patient Records"}
                {currentStage === "confirming_assignments" && "Stage 2 of 4: Confirming Caregiver Assignments"}
                {currentStage === "saving_decisions" && "Stage 3 of 4: Saving Validation Decisions"}
                {currentStage === "finalising" && "Stage 4 of 4: Finalising Results"}
              </span>
              <p className="text-[13px] font-medium text-[#101828]">
                {currentStage === "confirming_records" && "Verifying patient demand orders and care requirements eligibility..."}
                {currentStage === "confirming_assignments" && "Locking in selected caregiver assignments and operational routes..."}
                {currentStage === "saving_decisions" && "Persisting operator decisions to audit log and updating case records..."}
                {currentStage === "finalising" && "Preparing updated patient case records for Cases Overview..."}
              </p>
            </div>

            {/* Animated Progression Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-[12px] font-medium text-[#667085] mb-1.5">
                <span>Validation Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#EAECF0] overflow-hidden">
                <motion.div
                  className="h-full bg-[#007AFF]"
                  initial={{ width: "15%" }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ ease: "easeInOut", duration: 0.5 }}
                />
              </div>
            </div>

            {/* Pairings Confirmation Checklist */}
            <div className="mt-6 border-t border-[#EAECF0] pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] block mb-3">
                Pairings Confirmation Pipeline ({confirmedPairingIds.length}/{eligiblePairings.length})
              </span>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                <AnimatePresence>
                  {eligiblePairings.map((pairing) => {
                    const isConfirmed = confirmedPairingIds.includes(pairing.id);
                    return (
                      <motion.div
                        key={pairing.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center justify-between rounded-lg border p-3 text-[13px] transition-colors ${
                          isConfirmed
                            ? "border-[#34C759]/40 bg-[#34C759]/5"
                            : "border-[#EAECF0] bg-[#F8FAFC]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-3">
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                            isConfirmed ? "bg-[#34C759] text-white" : "bg-[#D0D5DD] text-white"
                          }`}>
                            {isConfirmed ? "✓" : "•"}
                          </span>
                          <div>
                            <span className="font-semibold text-[#101828] block">{pairing.patientName}</span>
                            <span className="text-[11px] text-[#667085]">{pairing.disciplineNeeded} &bull; ZIP {pairing.zipCode}</span>
                          </div>
                        </div>

                        {/* Connecting Line / Arrow */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-[#98A2B3]">&rarr;</span>
                          <div className="text-right">
                            <span className="font-medium text-[#101828] block">
                              {pairing.selectedCaregiver?.name}
                            </span>
                            <span className="text-[11px] font-mono text-[#007AFF]">
                              {isConfirmed ? "Confirmed Match" : "Validating..."}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {unresolvedPatients.length > 0 && (
                <div className="mt-3 text-[11px] text-[#667085] italic">
                  * Note: {unresolvedPatients.length} unresolved/incomplete patient records will remain with current intake status.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}