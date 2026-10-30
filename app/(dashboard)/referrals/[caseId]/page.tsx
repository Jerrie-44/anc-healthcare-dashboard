// app/(dashboard)/referrals/[caseId]/page.tsx
"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_REFERRALS, Referral } from "@/types/referral";
import {
  TriageBadge,
  PriorityBadge,
  ExtractionBadge,
} from "@/components/application/referrals/referral-badges";
import { Breadcrumb, BreadcrumbItem } from "@/components/base/breadcrumb/breadcrumb";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ caseId: string }>;
}

export default function ReferralDetailPage({ params }: PageProps) {
  const { caseId } = use(params);

  const referralData = useMemo<Referral | null>(() => {
    const existing = MOCK_REFERRALS.find(
      (r) => r.id.toLowerCase() === caseId.toLowerCase()
    );
    if (existing) return existing;

    if (caseId.toUpperCase() === "REF-9021") {
      return {
        id: "REF-9021",
        patientName: "Harold Jenkins",
        dob: "1958-04-14",
        primaryCondition: "Diabetic Foot Ulcer & Wound Debridement",
        priority: "Urgent",
        triageStage: "Pending Review",
        extractionStatus: "Extracted",
        referringProvider: "Mercy General Endocrine Clinic",
        receivedDate: "2026-10-29",
      };
    }

    return null;
  }, [caseId]);

  if (!referralData) {
    notFound();
  }

  const [currentStage, setCurrentStage] = useState(referralData.triageStage);
  const [priority, setPriority] = useState(referralData.priority);
  const [clinicianNotes, setClinicianNotes] = useState(
    "Patient exhibits Grade 3 neuropathic ulceration on plantar aspect of left foot. Wound vac therapy required 3x weekly. Needs home health aide coordination."
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveTriage = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8fafc] p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6">
        
        {/* BoardUI Breadcrumbs */}
        <Breadcrumb aria-label="Referral Navigation">
          <BreadcrumbItem href="/referrals">Referrals Directory</BreadcrumbItem>
          <BreadcrumbItem current>{referralData.id}</BreadcrumbItem>
        </Breadcrumb>

        {/* Clinical Case Header (Clean - Unboxed, transparent background, no shadow) */}
        <div className="flex flex-col justify-between gap-4 py-2 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-display-4-medium tracking-tight text-text-primary">
                {referralData.patientName}
              </h1>
              <span className="font-mono text-body-2-medium text-text-secondary">
                ({referralData.id})
              </span>
              <TriageBadge stage={currentStage} />
              <PriorityBadge priority={priority} />
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-6 text-body-2-regular text-text-secondary">
              <div>
                <span className="text-text-tertiary">DOB:</span>{" "}
                <span className="font-medium text-text-primary">{referralData.dob}</span>
              </div>
              <div>
                <span className="text-text-tertiary">Referring Source:</span>{" "}
                <span className="font-medium text-text-primary">
                  {referralData.referringProvider}
                </span>
              </div>
              <div>
                <span className="text-text-tertiary">Extraction:</span>{" "}
                <ExtractionBadge status={referralData.extractionStatus} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/referrals/${referralData.id}/match`}
              className="inline-flex items-center justify-center rounded-[10px] bg-[#007aff] px-4 py-2.5 text-body-2-medium font-medium text-white shadow-xs transition hover:bg-[#0062cc]"
            >
              Match Clinician &rarr;
            </Link>
          </div>
        </div>

        {/* 2-Column Split: Clinical Entities vs Triage Decision Action */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Left Column (2 spans): Clinical Data & Entity Review */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            
            {/* AI Extraction Confidence Box */}
            <div className="flex items-center justify-between rounded-[10px] border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-800">
              <div className="flex items-center gap-2.5">
                <svg className="h-5 w-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-body-2-medium">
                  Document scanned with high confidence (98.4%). Clinical entities matched against ICD-10 registry.
                </div>
              </div>
              <span className="rounded-md bg-white px-2 py-0.5 text-caption-1-bold text-emerald-700 shadow-2xs">
                VERIFIED
              </span>
            </div>

            {/* Extracted Clinical Entity Card */}
            <div className="flex flex-col gap-4 rounded-[10px] border border-[#eaecf0] bg-white p-6 shadow-sm">
              <h2 className="text-headline-semibold text-text-primary">
                Parsed Clinical Profile
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1 rounded-[10px] border border-[#eaecf0] bg-slate-50 p-3.5">
                  <span className="text-caption-1-medium text-text-tertiary">
                    Primary Diagnosis / Care Reason
                  </span>
                  <span className="text-body-2-medium text-text-primary">
                    {referralData.primaryCondition}
                  </span>
                </div>

                <div className="flex flex-col gap-1 rounded-[10px] border border-[#eaecf0] bg-slate-50 p-3.5">
                  <span className="text-caption-1-medium text-text-tertiary">
                    Care Discipline Required
                  </span>
                  <span className="text-body-2-medium text-text-primary">
                    Wound Care Certified Nurse (RN-WCC)
                  </span>
                </div>

                <div className="flex flex-col gap-1 rounded-[10px] border border-[#eaecf0] bg-slate-50 p-3.5">
                  <span className="text-caption-1-medium text-text-tertiary">
                    Service Frequency
                  </span>
                  <span className="text-body-2-medium text-text-primary">
                    3x Weekly for 4 Weeks
                  </span>
                </div>

                <div className="flex flex-col gap-1 rounded-[10px] border border-[#eaecf0] bg-slate-50 p-3.5">
                  <span className="text-caption-1-medium text-text-tertiary">
                    Estimated Visit Duration
                  </span>
                  <span className="text-body-2-medium text-text-primary">
                    45–60 Minutes
                  </span>
                </div>
              </div>

              {/* Source Document Reference */}
              <div className="mt-2 flex items-center justify-between rounded-[10px] border border-[#eaecf0] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-emerald-50 font-bold text-emerald-700 text-xs">
                    PDF
                  </div>
                  <div>
                    <div className="text-body-2-medium text-text-primary">
                      referral_slip_intake_{referralData.id.toLowerCase()}.pdf
                    </div>
                    <div className="text-caption-1-regular text-text-tertiary">
                      Attached clinic transfer packet &bull; 1.4 MB
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-[8px] border border-[#d0d5dd] bg-white px-3 py-1.5 text-caption-1-medium text-text-secondary hover:bg-slate-50"
                >
                  Download Source
                </button>
              </div>
            </div>

            {/* Clinical Directives & Patient Instructions */}
            <div className="flex flex-col gap-4 rounded-[10px] border border-[#eaecf0] bg-white p-6 shadow-sm">
              <h2 className="text-headline-semibold text-text-primary">
                Triage Directives & Safety Notes
              </h2>
              <textarea
                rows={4}
                value={clinicianNotes}
                onChange={(e) => setClinicianNotes(e.target.value)}
                className="w-full rounded-[10px] border border-[#d0d5dd] p-3.5 text-body-2-regular text-text-primary focus:border-[#007aff] focus:outline-none"
                placeholder="Enter clinical assessment directives..."
              />
            </div>
          </div>

          {/* Right Column (1 span): Triage Management Console */}
          <div className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-5 rounded-[10px] border border-[#eaecf0] bg-white p-6 shadow-sm">
              <h2 className="text-headline-semibold text-text-primary">
                Triage Decision
              </h2>

              {/* Triage Stage Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-caption-1-medium text-text-secondary">
                  Update Case Stage
                </label>
                <select
                  value={currentStage}
                  onChange={(e) => setCurrentStage(e.target.value as any)}
                  className="rounded-[10px] border border-[#d0d5dd] bg-white px-3.5 py-2 text-body-2-medium text-text-primary focus:border-[#007aff] focus:outline-none"
                >
                  <option value="Ready for Matching">Ready for Matching</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Matched">Matched</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              {/* Acuity / Priority Override */}
              <div className="flex flex-col gap-1.5">
                <label className="text-caption-1-medium text-text-secondary">
                  Acuity Tier (Priority)
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="rounded-[10px] border border-[#d0d5dd] bg-white px-3.5 py-2 text-body-2-medium text-text-primary focus:border-[#007aff] focus:outline-none"
                >
                  <option value="Urgent">Urgent (Within 24 Hours)</option>
                  <option value="High">High (Within 48 Hours)</option>
                  <option value="Standard">Standard (Within 5 Days)</option>
                </select>
              </div>

              {/* Save Feedback Banner */}
              {saveSuccess && (
                <div className="rounded-[8px] bg-emerald-50 p-2.5 text-center text-caption-1-medium text-emerald-800">
                  Triage updates saved successfully.
                </div>
              )}

              {/* Action Buttons */}
              <button
                type="button"
                onClick={handleSaveTriage}
                className="w-full rounded-[10px] bg-[#007aff] py-2.5 text-body-2-medium font-medium text-white shadow-xs transition hover:bg-[#0062cc]"
              >
                Save Triage Updates
              </button>

              <button
                type="button"
                onClick={() => setCurrentStage("On Hold")}
                className="w-full rounded-[10px] border border-[#d0d5dd] bg-white py-2.5 text-body-2-medium text-text-primary hover:bg-slate-50"
              >
                Place on Clinical Hold
              </button>
            </div>

            {/* Quick Demographics Summary */}
            <div className="flex flex-col gap-3 rounded-[10px] border border-[#eaecf0] bg-white p-6 shadow-sm">
              <h3 className="text-body-medium font-semibold text-text-primary">
                Patient Contact
              </h3>
              <div className="flex flex-col gap-2 text-body-2-regular text-text-secondary">
                <div>
                  <span className="text-text-tertiary">Phone:</span> (555) 438-2910
                </div>
                <div>
                  <span className="text-text-tertiary">Address:</span> 742 Evergreen Terr, Springfield
                </div>
                <div>
                  <span className="text-text-tertiary">Insurance:</span> Blue Cross Shield (PPO #98102)
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}