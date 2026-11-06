// app/(dashboard)/placements/new/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { MOCK_CASES_DB } from "@/lib/referral-service";
import { createOfficialPlacement } from "@/lib/placement-service";

function PlacementCreationWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId") || "REF-4091";
  const selectedCaregiverId = searchParams.get("caregiverId") || "CG-8012";

  const caseRecord = MOCK_CASES_DB.find((c) => c.id === caseId);
  const recommendation = caseRecord?.recommendations.find((r) => r.caregiverId === selectedCaregiverId) || {
    caregiverId: selectedCaregiverId,
    caregiverName: "Elena V. Rostova",
    discipline: "Wound Care Certified Nurse (RN-WCC)",
    matchScore: 98,
    distanceMiles: 3.4,
    activeCaseload: 2,
    maxCaseload: 4,
    matchingRationale: "Proximity match within 3.4 miles and NPWT certification.",
    credentials: ["RN", "WCC"],
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmPlacementCreation = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Idempotency protection against double clicks
    setIsSubmitting(true);

    setTimeout(() => {
      const placement = createOfficialPlacement(
        caseId,
        recommendation.caregiverId,
        recommendation.caregiverName,
        recommendation.discipline,
        "(412) 555-0192",
        1,
        "Dr. R. Sterling (Lead Clinical Dispatcher)"
      );

      router.push(`/placements/${placement.id}`);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-['Clash_Grotesk'] text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1105px] flex-col gap-6 px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eaecf0] pb-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#667085] mb-1">
              <Link href="/referrals" className="hover:text-[#007aff]">Cases &amp; Referrals</Link>
              <span>/</span>
              <span className="font-mono text-[#101828]">{caseId}</span>
              <span>/</span>
              <span>Confirm Placement Creation</span>
            </div>
            <h1 className="text-[32px] font-[500] leading-tight text-[#101828]">
              Confirm Official Caregiver Placement
            </h1>
          </div>
          <Link href={`/referrals/${caseId}`} className="text-[14px] text-[#667085] hover:text-[#101828]">
            &larr; Cancel &amp; Back to Case
          </Link>
        </div>

        {/* Business Rule Banner */}
        <div className="rounded-[8px] border border-[#007AFF]/30 bg-[#007AFF]/5 p-4 text-[13px] text-[#344054]">
          <strong className="text-[#007AFF] font-medium block mb-0.5">Official Placement Creation Rule:</strong>
          Confirming this selection creates the official, auditable placement record. Caregiver acceptance, schedule coordination, and activation remain separate subsequent stages.
        </div>

        {/* Comparison Summary Grid */}
        <form onSubmit={handleConfirmPlacementCreation} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Patient Referral Context */}
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs flex flex-col gap-3">
            <h3 className="text-[16px] font-[500] text-[#101828] border-b border-[#D0D5DD] pb-2">
              1. Validated Referral Context
            </h3>
            <div className="text-[14px]">
              <span className="text-[#667085] text-[12px] block">Patient Name</span>
              <strong className="text-[#101828]">{caseRecord?.draftProfile.patientName.value}</strong>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div>
                <span className="text-[#667085] text-[12px] block">Territory ZIP</span>
                <span className="font-mono">{caseRecord?.draftProfile.zipCode.value}</span>
              </div>
              <div>
                <span className="text-[#667085] text-[12px] block">Discipline Required</span>
                <span>{caseRecord?.draftProfile.careDisciplineRequired.value}</span>
              </div>
            </div>
            <div className="text-[13px]">
              <span className="text-[#667085] text-[12px] block">Authorized Hours</span>
              <span>{caseRecord?.draftProfile.authorizedHoursPerWeek.value} hrs / week</span>
            </div>
            <div className="rounded bg-[#F8FAFC] border border-[#D0D5DD] p-2.5 text-[12px] text-[#475467] mt-1">
              <strong>Clinical Directives:</strong> {caseRecord?.draftProfile.clinicalNotesSummary.value}
            </div>
          </div>

          {/* Selected Caregiver Context */}
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-2">
              <h3 className="text-[16px] font-[500] text-[#101828]">2. Selected Recommended Clinician</h3>
              <span className="font-semibold text-[#1E7E34] text-[13px]">{recommendation.matchScore}% Match</span>
            </div>
            <div className="text-[14px]">
              <span className="text-[#667085] text-[12px] block">Caregiver Name</span>
              <strong className="text-[#101828]">{recommendation.caregiverName}</strong>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div>
                <span className="text-[#667085] text-[12px] block">Clinician ID</span>
                <span className="font-mono">{recommendation.caregiverId}</span>
              </div>
              <div>
                <span className="text-[#667085] text-[12px] block">Distance to Patient</span>
                <span>{recommendation.distanceMiles} miles</span>
              </div>
            </div>
            <div className="text-[13px]">
              <span className="text-[#667085] text-[12px] block">Active Caseload</span>
              <span>{recommendation.activeCaseload} of {recommendation.maxCaseload} active assignments</span>
            </div>
            <div className="rounded bg-[#F8FAFC] border border-[#D0D5DD] p-2.5 text-[12px] text-[#475467] mt-1">
              <strong>Matching Rationale:</strong> {recommendation.matchingRationale}
            </div>
          </div>

          {/* Explicit Confirmation Footer */}
          <div className="md:col-span-2 rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[14px] font-medium text-[#101828] block">Confirm and Authorize Selection</span>
              <span className="text-[12px] text-[#667085]">
                Operator: Dr. R. Sterling &bull; System will assign unique Placement ID and route to Contact Desk.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-[8px] bg-[#007AFF] px-6 py-2.5 text-[14px] font-[500] text-white shadow-xs hover:bg-[#0066CC] disabled:bg-[#D0D5DD] transition-colors shrink-0"
            >
              {isSubmitting ? "Creating Official Placement..." : "Confirm & Create Official Placement \u2192"}
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}

export default function NewPlacementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] p-8">Loading placement context...</div>}>
      <PlacementCreationWorkspace />
    </Suspense>
  );
}