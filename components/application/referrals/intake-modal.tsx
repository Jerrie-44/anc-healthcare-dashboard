// components/application/referrals/intake-modal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTrigger,
} from "@/components/base/modal/modal";
import { Chip } from "@/components/base/badges/chip";

interface ExtractedData {
  id: string;
  patientName: string;
  dob: string;
  primaryCondition: string;
  priority: "Urgent" | "High" | "Standard";
  referringProvider: string;
  notes: string;
}

const SAMPLE_CASE: ExtractedData = {
  id: "REF-9021",
  patientName: "Harold Jenkins",
  dob: "1958-04-14",
  primaryCondition: "Diabetic Foot Ulcer & Wound Debridement",
  priority: "Urgent",
  referringProvider: "Mercy General Endocrine Clinic",
  notes: "Grade 3 neuropathic ulcer. Requires wound vac dressing every 48 hours and mobility assessment.",
};

export function IntakeModal() {
  const router = useRouter();
  const [phase, setPhase] = useState<"upload" | "scanning" | "review">("upload");
  const [scanStep, setScanStep] = useState(0);
  const [data, setData] = useState<ExtractedData>(SAMPLE_CASE);

  const startExtraction = () => {
    setPhase("scanning");
    setScanStep(1);

    setTimeout(() => setScanStep(2), 700);
    setTimeout(() => setScanStep(3), 1400);
    setTimeout(() => {
      setPhase("review");
    }, 2000);
  };

  const handleReset = () => {
    setPhase("upload");
    setScanStep(0);
  };

  const handleConfirm = (close: () => void) => {
    close();
    handleReset();
    router.push(`/referrals/${data.id}`);
  };

  return (
    <ModalTrigger>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#007aff] px-4 py-2.5 text-body-medium font-medium text-white shadow-sm transition-colors duration-150 hover:bg-[#0062cc] active:bg-[#0051a8]"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Upload Referral
      </button>

      <Modal className="rounded-[10px] overflow-hidden p-0 border border-[#eaecf0] bg-white">
        {({ close }) => (
          <div className="flex w-full max-w-[560px] flex-col rounded-[10px] bg-white overflow-hidden">
            {/* Header */}
            <div className="border-b border-[#eaecf0] p-6 pb-4">
              <ModalHeader
                title={
                  phase === "upload"
                    ? "AI Referral Document Intake"
                    : phase === "scanning"
                    ? "Extracting Clinical Entities..."
                    : "Review Extracted Referral"
                }
                description={
                  phase === "upload"
                    ? "Upload a referral slip, clinical summary, or discharge packet (PDF, PNG, JPG)."
                    : phase === "scanning"
                    ? "Analyzing document text, identifying diagnoses, and establishing acuity tier."
                    : "Review the extracted patient entities before adding to the triage queue."
                }
              />
            </div>

            <ModalBody className="p-6">
              {/* PHASE 1: FILE UPLOAD DROPZONE */}
              {phase === "upload" && (
                <div className="flex flex-col gap-4">
                  <div
                    onClick={startExtraction}
                    className="flex flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#d0d5dd] bg-[#f8fafc] px-6 py-8 text-center transition-colors duration-150 hover:border-[#007aff] hover:bg-blue-50/20 cursor-pointer"
                  >
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-[#007aff]">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>

                    <p className="text-body-2-medium font-medium text-text-primary">
                      Click to upload or drag and drop
                    </p>
                    <p className="mt-1 text-caption-1-regular text-text-tertiary">
                      PDF, PNG, or JPG up to 25MB
                    </p>
                  </div>

                  <div className="relative flex items-center justify-center">
                    <span className="w-full border-t border-[#eaecf0]" />
                    <span className="absolute bg-white px-3 text-[11px] font-semibold tracking-wider text-text-tertiary uppercase">
                      Or Test Sample
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={startExtraction}
                    className="flex items-center justify-between rounded-[10px] border border-[#eaecf0] bg-white p-3 text-left transition-colors duration-150 hover:border-[#007aff] hover:bg-[#f9fafb]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-emerald-50 text-[11px] font-bold text-emerald-700">
                        PDF
                      </div>
                      <div>
                        <div className="text-body-2-medium text-text-primary">
                          sample_referral_mercy_hospital.pdf
                        </div>
                        <div className="text-caption-1-regular text-text-tertiary">
                          Preloaded clinical intake packet (1.2 MB)
                        </div>
                      </div>
                    </div>
                    <span className="rounded-[6px] bg-blue-50 px-2.5 py-1 text-caption-1-medium text-[#007aff] transition-colors duration-150 group-hover:bg-blue-100">
                      Process &rarr;
                    </span>
                  </button>
                </div>
              )}

              {/* PHASE 2: ANIMATED SCANNER */}
              {phase === "scanning" && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="relative mb-5 flex h-14 w-14 items-center justify-center">
                    <div className="absolute h-full w-full animate-ping rounded-full bg-blue-400/20" />
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#007aff] text-white shadow-md">
                      <svg
                        className="h-6 w-6 animate-pulse"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="flex w-full max-w-sm flex-col gap-2.5 text-left">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                          scanStep >= 1 ? "bg-emerald-500" : "bg-slate-300 animate-pulse"
                        }`}
                      />
                      <span className="text-body-2-medium text-text-secondary">
                        Reading unstructured clinician notes
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                          scanStep >= 2 ? "bg-emerald-500" : "bg-slate-300 animate-pulse"
                        }`}
                      />
                      <span className="text-body-2-medium text-text-secondary">
                        Parsing demographics & insurance identifiers
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                          scanStep >= 3 ? "bg-emerald-500" : "bg-slate-300 animate-pulse"
                        }`}
                      />
                      <span className="text-body-2-medium text-text-secondary">
                        Evaluating urgency & clinical acuity tier
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* PHASE 3: REVIEW FORM */}
              {phase === "review" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between rounded-[8px] bg-emerald-50 px-3.5 py-2 text-emerald-800">
                    <span className="text-caption-1-medium flex items-center gap-1.5">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      AI extraction complete (Confidence: 98.4%)
                    </span>
                    <span className="font-mono text-caption-1-bold text-emerald-900">
                      {data.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-caption-1-medium text-text-secondary">
                        Patient Name
                      </label>
                      <input
                        type="text"
                        value={data.patientName}
                        onChange={(e) =>
                          setData({ ...data, patientName: e.target.value })
                        }
                        className="rounded-[10px] border border-[#d0d5dd] bg-slate-50 px-3 py-2 text-body-2-medium text-text-primary transition-colors focus:border-[#007aff] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-caption-1-medium text-text-secondary">
                        Date of Birth
                      </label>
                      <input
                        type="text"
                        value={data.dob}
                        onChange={(e) => setData({ ...data, dob: e.target.value })}
                        className="rounded-[10px] border border-[#d0d5dd] bg-slate-50 px-3 py-2 text-body-2-medium text-text-primary transition-colors focus:border-[#007aff] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-caption-1-medium text-text-secondary">
                      Primary Condition & Diagnosis
                    </label>
                    <input
                      type="text"
                      value={data.primaryCondition}
                      onChange={(e) =>
                        setData({ ...data, primaryCondition: e.target.value })
                      }
                      className="rounded-[10px] border border-[#d0d5dd] bg-slate-50 px-3 py-2 text-body-2-medium text-text-primary transition-colors focus:border-[#007aff] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-caption-1-medium text-text-secondary">
                        Referring Facility
                      </label>
                      <input
                        type="text"
                        value={data.referringProvider}
                        onChange={(e) =>
                          setData({ ...data, referringProvider: e.target.value })
                        }
                        className="rounded-[10px] border border-[#d0d5dd] bg-slate-50 px-3 py-2 text-body-2-medium text-text-primary transition-colors focus:border-[#007aff] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-caption-1-medium text-text-secondary">
                        Priority Level
                      </label>
                      <div className="pt-1.5">
                        <Chip variant="bold" color="rose">
                          {data.priority}
                        </Chip>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-caption-1-medium text-text-secondary">
                      Clinical Directives / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={data.notes}
                      onChange={(e) => setData({ ...data, notes: e.target.value })}
                      className="rounded-[10px] border border-[#d0d5dd] bg-white px-3 py-2 text-body-2-regular text-text-primary transition-colors focus:border-[#007aff] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </ModalBody>

            <div className="border-t border-[#eaecf0] bg-slate-50/50 p-4 px-6 rounded-b-[10px]">
              <ModalFooter>
                {phase === "upload" && (
                  <div className="flex w-full justify-end">
                    <button
                      type="button"
                      onClick={close}
                      className="rounded-[10px] border border-[#d0d5dd] bg-white px-4 py-2 text-body-2-medium text-[#344054] shadow-xs transition-colors duration-150 hover:bg-[#f9fafb] hover:text-[#1d2939] active:bg-[#f2f4f7]"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {phase === "scanning" && (
                  <div className="flex w-full justify-end">
                    <button
                      type="button"
                      disabled
                      className="rounded-[10px] bg-slate-200 px-4 py-2 text-body-2-medium text-slate-500 cursor-not-allowed"
                    >
                      Extracting...
                    </button>
                  </div>
                )}

                {phase === "review" && (
                  <div className="flex w-full items-center justify-between">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="rounded-lg px-2 py-1 text-body-2-medium text-text-secondary transition-colors duration-150 hover:text-text-primary hover:bg-slate-100/60 active:bg-slate-200/60"
                    >
                      &larr; Re-upload
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleReset();
                          close();
                        }}
                        className="rounded-[10px] border border-[#d0d5dd] bg-white px-4 py-2 text-body-2-medium text-[#344054] shadow-xs transition-colors duration-150 hover:bg-[#f9fafb] hover:text-[#1d2939] active:bg-[#f2f4f7]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirm(close)}
                        className="rounded-[10px] bg-[#007aff] px-4 py-2 text-body-2-medium font-medium text-white shadow-xs transition-colors duration-150 hover:bg-[#0062cc] active:bg-[#0051a8]"
                      >
                        Confirm & Open Case &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </ModalFooter>
            </div>
          </div>
        )}
      </Modal>
    </ModalTrigger>
  );
}