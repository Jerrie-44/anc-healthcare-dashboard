// app/(dashboard)/referrals/[caseId]/match/page.tsx
"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { MOCK_REFERRALS, Referral } from "@/types/referral";
import { MOCK_CLINICIANS, Clinician } from "@/types/clinician";
import { PriorityBadge } from "@/components/application/referrals/referral-badges";
import { Breadcrumb, BreadcrumbItem } from "@/components/base/breadcrumb/breadcrumb";

interface PageProps {
  params: Promise<{ caseId: string }>;
}

export default function ReferralMatchPage({ params }: PageProps) {
  const router = useRouter();
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
        triageStage: "Ready for Matching",
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

  const [selectedClinicianId, setSelectedClinicianId] = useState<string>("CLN-104");
  const [filterDiscipline, setFilterDiscipline] = useState<string>("All");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  const filteredClinicians = useMemo(() => {
    return MOCK_CLINICIANS.filter((c) => {
      if (filterDiscipline === "All") return true;
      return c.discipline.includes(filterDiscipline);
    });
  }, [filterDiscipline]);

  const handleAssign = (clinician: Clinician) => {
    setIsAssigning(true);
    setTimeout(() => {
      setIsAssigning(false);
      setAssignedSuccess(true);
      setTimeout(() => {
        router.push(`/referrals/${referralData.id}`);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8fafc] p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6">

        {/* BoardUI Breadcrumbs */}
        <Breadcrumb aria-label="Matching Navigation">
          <BreadcrumbItem href="/referrals">Referrals Directory</BreadcrumbItem>
          <BreadcrumbItem href={`/referrals/${referralData.id}`}>
            {referralData.id}
          </BreadcrumbItem>
          <BreadcrumbItem current>Clinician Matching</BreadcrumbItem>
        </Breadcrumb>

        {/* Top Header Card */}
        <div className="flex flex-col justify-between gap-4 rounded-[10px] border border-[#eaecf0] bg-white p-6 shadow-sm lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-display-4-medium tracking-tight text-text-primary">
                Clinician Match Engine
              </h1>
              <PriorityBadge priority={referralData.priority} />
            </div>
            <p className="mt-1 text-body-2-regular text-text-secondary">
              Evaluating geographic radius, credentials, and real-time caseload for{" "}
              <span className="font-semibold text-text-primary">
                {referralData.patientName}
              </span>{" "}
              ({referralData.id}).
            </p>
          </div>

          <Link
            href={`/referrals/${referralData.id}`}
            className="rounded-[10px] border border-[#d0d5dd] bg-white px-4 py-2 text-body-2-medium text-[#344054] shadow-xs transition hover:bg-[#f9fafb]"
          >
            &larr; Back to Case
          </Link>
        </div>

        {/* Success Alert Banner */}
        {assignedSuccess && (
          <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <div className="flex items-center gap-2 font-medium">
              <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Care provider assigned successfully. Returning to case profile...
            </div>
          </div>
        )}

        {/* Main Grid: Left Spec Requirements vs Right Roster */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left Column: Target Patient Criteria */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 rounded-[10px] border border-[#eaecf0] bg-white p-6 shadow-sm">
              <h2 className="text-headline-semibold text-text-primary">
                Assignment Criteria
              </h2>

              <div className="flex flex-col gap-3">
                <div className="rounded-[8px] border border-[#eaecf0] bg-slate-50 p-3">
                  <span className="text-caption-1-medium text-text-tertiary">
                    Required Clinical Discipline
                  </span>
                  <p className="mt-0.5 text-body-2-medium text-text-primary">
                    Wound Care Certified Nurse (RN-WCC)
                  </p>
                </div>

                <div className="rounded-[8px] border border-[#eaecf0] bg-slate-50 p-3">
                  <span className="text-caption-1-medium text-text-tertiary">
                    Primary Diagnosis
                  </span>
                  <p className="mt-0.5 text-body-2-medium text-text-primary">
                    {referralData.primaryCondition}
                  </p>
                </div>

                <div className="rounded-[8px] border border-[#eaecf0] bg-slate-50 p-3">
                  <span className="text-caption-1-medium text-text-tertiary">
                    Patient Address & Travel Zone
                  </span>
                  <p className="mt-0.5 text-body-2-medium text-text-primary">
                    Springfield Metro (Zone 2)
                  </p>
                </div>

                <div className="rounded-[8px] border border-[#eaecf0] bg-slate-50 p-3">
                  <span className="text-caption-1-medium text-text-tertiary">
                    Target Start Frequency
                  </span>
                  <p className="mt-0.5 text-body-2-medium text-text-primary">
                    3x Weekly &bull; Urgent (&lt; 24h)
                  </p>
                </div>
              </div>

              {/* Discipline Quick Filters */}
              <div className="mt-2 flex flex-col gap-1.5 border-t border-[#eaecf0] pt-4">
                <span className="text-caption-1-medium text-text-secondary">
                  Filter Candidates by Discipline
                </span>
                <div className="flex flex-wrap gap-2">
                  {["All", "Wound Care", "Physical Therapist", "Home Health"].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setFilterDiscipline(tag)}
                        className={`rounded-[8px] px-3 py-1 text-caption-1-medium transition ${
                          filterDiscipline === tag
                            ? "bg-[#007aff] text-white"
                            : "border border-[#d0d5dd] bg-white text-[#344054] hover:bg-slate-50"
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (2 spans): Candidate Clinician Cards */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-semibold text-text-primary">
                Matched Clinicians ({filteredClinicians.length})
              </h2>
              <span className="text-caption-1-regular text-text-tertiary">
                Sorted by AI Fit & Travel Distance
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {filteredClinicians.map((clinician) => {
                const isSelected = selectedClinicianId === clinician.id;

                return (
                  <div
                    key={clinician.id}
                    onClick={() => setSelectedClinicianId(clinician.id)}
                    className={`flex flex-col justify-between gap-4 rounded-[10px] border p-5 transition cursor-pointer sm:flex-row sm:items-center ${
                      isSelected
                        ? "border-[#007aff] bg-blue-50/20 shadow-sm"
                        : "border-[#eaecf0] bg-white hover:border-[#b2d5ff]"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-body-medium font-semibold text-text-primary">
                          {clinician.name}
                        </span>
                        <span className="font-mono text-caption-1-regular text-text-tertiary">
                          {clinician.id}
                        </span>
                        
                        {/* Match Score Badge */}
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            clinician.matchScore >= 90
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : clinician.matchScore >= 80
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {clinician.matchScore}% Match
                        </span>
                      </div>

                      <div className="text-body-2-regular text-text-secondary">
                        {clinician.discipline} &bull;{" "}
                        <span className="font-medium text-text-primary">
                          {clinician.distanceMiles} miles away
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {clinician.credentials.map((cred) => (
                          <span
                            key={cred}
                            className="rounded-[6px] border border-[#eaecf0] bg-slate-50 px-2 py-0.5 text-caption-2-medium text-text-secondary"
                          >
                            {cred}
                          </span>
                        ))}
                        <span className="text-caption-2-regular text-text-tertiary ml-2">
                          Caseload: {clinician.activeCaseload}/{clinician.maxCaseload}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className={`text-caption-1-medium ${
                          clinician.availability === "Immediate"
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}
                      >
                        Availability: {clinician.availability}
                      </span>

                      <button
                        type="button"
                        disabled={isAssigning}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssign(clinician);
                        }}
                        className={`rounded-[10px] px-4 py-2 text-body-2-medium font-medium transition ${
                          isSelected
                            ? "bg-[#007aff] text-white shadow-xs hover:bg-[#0062cc]"
                            : "border border-[#d0d5dd] bg-white text-text-primary hover:bg-slate-50"
                        }`}
                      >
                        {isAssigning && isSelected
                          ? "Assigning..."
                          : isSelected
                          ? "Assign Clinician &rarr;"
                          : "Select Candidate"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}