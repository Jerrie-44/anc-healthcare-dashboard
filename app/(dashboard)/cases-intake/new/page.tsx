// app/(dashboard)/cases-intake/new/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ExtractedPatientCase, 
  RankedCaregiverMatch,
  CaseIntakeRecord
} from "@/types/cases-intake";
import { MOCK_CAREGIVERS_POOL } from "@/lib/cases-intake-service";
import { upsertValidatedCases } from "../../../../lib/cases-store";
import { AIReviewAnimation } from "@/components/application/cases-intake/ai-review-animation";
import { AIMatchingAnimation } from "@/components/application/cases-intake/ai-matching-animation";
import { ValidationProcessScreen } from "@/components/application/cases-intake/validation-process-screen";

type WorkflowStep = 
  | "upload"                // Step 1: Upload dropzone only
  | "ai_review"             // Step 1: ~3s per stage verification animation
  | "extracted_patients"    // Step 1: Patient review table with inline corrections
  | "ai_matching"           // Step 2: ~3s per stage pairing animation
  | "matching_results"      // Step 3: Two-panel interactive workspace
  | "validating";           // Step 4: Full-page validation animation & redirect

export default function NewReferralWorkflowPage() {
  const router = useRouter();
  const [step, setStep] = useState<WorkflowStep>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [patients, setPatients] = useState<ExtractedPatientCase[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Inline correction state for incomplete patients (Stage 1)
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [correctionZip, setCorrectionZip] = useState("");

  // Validation modal state (Stage 3)
  const [isValidationConfirmOpen, setIsValidationConfirmOpen] = useState(false);
  const [isSubmittingValidation, setIsSubmittingValidation] = useState(false);

  // ----------------------------------------------------
  // FLOW 1: UPLOAD & AI REVIEW
  // ----------------------------------------------------
  const handleCSVSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setStep("ai_review");
  };

  const handleReviewComplete = () => {
    const extractedData: ExtractedPatientCase[] = [
      {
        id: `CASE-2026-901`,
        patientName: "Harold Jenkins",
        dob: "1954-08-14",
        zipCode: "15213",
        disciplineNeeded: "Registered Nurse (RN)",
        hoursPerWeek: 16,
        nonSmokingHousehold: true,
        clinicalDirectives: "Post-op wound VAC irrigation and weekly dressing change protocol.",
        requirementStatus: "Complete",
        missingFields: [],
        matchingStatus: "Recommended",
      },
      {
        id: `CASE-2026-902`,
        patientName: "Beatrice Morales",
        dob: "1962-03-29",
        zipCode: "",
        disciplineNeeded: "Home Health Aide (HHA)",
        hoursPerWeek: 20,
        nonSmokingHousehold: false,
        clinicalDirectives: "Bathing assistance, meal prep, and transfer oversight.",
        requirementStatus: "Needs Information",
        missingFields: ["Patient ZIP Code"],
        matchingStatus: "Needs Information",
      },
      {
        id: `CASE-2026-903`,
        patientName: "Walter G. Henderson",
        dob: "1948-11-02",
        zipCode: "15206",
        disciplineNeeded: "Physical Therapist (PT)",
        hoursPerWeek: 6,
        nonSmokingHousehold: true,
        clinicalDirectives: "Post-stroke mobility reconditioning and bilateral cane gait transition.",
        requirementStatus: "Complete",
        missingFields: [],
        matchingStatus: "Recommended",
      },
    ];

    setPatients(extractedData);
    setStep("extracted_patients");
  };

  const handleSaveCorrection = (patientId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          zipCode: correctionZip || "15213",
          requirementStatus: "Complete",
          missingFields: [],
          matchingStatus: "Recommended",
        };
      })
    );
    setEditingPatientId(null);
    setCorrectionZip("");
  };

  // ----------------------------------------------------
  // FLOW 2: AI CAREGIVER MATCHING & AUTO-SELECTION
  // ----------------------------------------------------
  const handleStartMatching = () => {
    setStep("ai_matching");
  };

  const handleMatchingComplete = () => {
    const matched = patients.map((patient) => {
      if (patient.requirementStatus !== "Complete") {
        return {
          ...patient,
          matchingStatus: "Needs Information" as const,
          selectionStatus: "Needs Information" as const,
          availableCandidates: [],
          selectedCaregiverId: null,
          selectedCaregiver: undefined,
        };
      }

      const candidates: RankedCaregiverMatch[] = MOCK_CAREGIVERS_POOL.filter((cg) => {
        const discMatch = cg.discipline.toLowerCase() === patient.disciplineNeeded.toLowerCase();
        const smokeMatch = !patient.nonSmokingHousehold || !cg.isSmoker;
        return discMatch && smokeMatch;
      }).map((cg, idx) => ({
        caregiverId: cg.id,
        name: cg.name,
        discipline: cg.discipline,
        overallScore: Math.round(96 - idx * 8),
        rank: idx + 1,
        allHardRulesPassed: true,
        hardRules: [
          { id: "hr-1", label: "Discipline", passed: true, requirementValue: patient.disciplineNeeded, candidateValue: cg.discipline },
          { id: "hr-2", label: "Smoking Rule", passed: true, requirementValue: patient.nonSmokingHousehold ? "Non-Smoker" : "Any", candidateValue: cg.isSmoker ? "Smoker" : "Non-Smoker" },
        ],
        commute: {
          distanceMiles: cg.commuteDistanceMiles,
          driveTimeMinutes: cg.commuteMinutes,
          originZip: cg.zipCode,
          destinationZip: patient.zipCode,
          trafficBand: (cg.commuteMinutes > 20 ? "Moderate" : "Light") as "Light" | "Moderate" | "Heavy",
        },
        certifications: cg.activeCertifications,
        voiceScreeningScore: cg.voiceScreeningScore,
        voiceSummary: cg.voiceSummary,
        matchRationale: [
          `Satisfies mandatory ${patient.disciplineNeeded} specialization`,
          `Estimated commute: ${cg.commuteMinutes} min drive via Azure Maps`,
          `AI Voice Screening verified communication score: ${cg.voiceScreeningScore}/5.0`,
        ],
      })).sort((a, b) => b.overallScore - a.overallScore);

      if (candidates.length === 0) {
        return {
          ...patient,
          matchingStatus: "Unmatched" as const,
          selectionStatus: "Unmatched" as const,
          availableCandidates: [],
          selectedCaregiverId: null,
          selectedCaregiver: undefined,
          unmatchedReason: "No caregivers satisfied mandatory discipline or non-smoking requirements within commute limits.",
        };
      }

      // Automatically select highest-ranked eligible recommendation (Rank #1)
      const topMatch = candidates[0];

      return {
        ...patient,
        matchingStatus: "Recommended" as const,
        selectionStatus: "Match Selected" as const,
        availableCandidates: candidates,
        selectedCaregiverId: topMatch.caregiverId,
        selectedCaregiver: topMatch,
      };
    });

    setPatients(matched);
    if (matched.length > 0) {
      setSelectedPatientId(matched[0].id);
    }
    setStep("matching_results");
  };

  // ----------------------------------------------------
  // FLOW 3: TWO-PANEL INTERACTION HANDLERS
  // ----------------------------------------------------
  const handleSelectCaregiverForPatient = (patientId: string, candidate: RankedCaregiverMatch) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          selectedCaregiverId: candidate.caregiverId,
          selectedCaregiver: candidate,
          selectionStatus: "Match Selected",
        };
      })
    );
  };

  // Explicit confirmation initiates the dedicated validation animation screen
  const handleInitiateValidation = () => {
    setIsSubmittingValidation(true);
    setIsValidationConfirmOpen(false);
    setStep("validating");
  };

  // Final Persistence & Automatic Navigation back to Cases Overview
  const handleValidationCompleteAndRedirect = (validatedRecords: ExtractedPatientCase[]) => {
    // Transform ExtractedPatientCase[] into CaseIntakeRecord[] for Cases Overview persistence
    const casesToStore: CaseIntakeRecord[] = validatedRecords.map((vp) => {
      const isVal = vp.matchingStatus === "Validated" && vp.selectedCaregiver;
      return {
        id: vp.id,
        patientName: vp.patientName,
        disciplineNeeded: vp.disciplineNeeded,
        hoursPerWeek: vp.hoursPerWeek,
        zipCode: vp.zipCode,
        nonSmokingHousehold: vp.nonSmokingHousehold,
        clinicalDirectives: vp.clinicalDirectives,
        missingFields: vp.missingFields,
        status: isVal ? "Validated" : vp.matchingStatus === "Unmatched" ? "Unmatched" : "Needs Information",
        validationDecision: isVal ? {
          validatedAt: vp.validatedAt || new Date().toISOString().replace("T", " ").substring(0, 16),
          validatedBy: vp.validatedBy || "Dispatcher Intake Desk",
          selectedCaregiverId: vp.selectedCaregiver!.caregiverId,
          selectedCaregiverName: vp.selectedCaregiver!.name,
          validationNotes: vp.validationNotes || "Validated via Two-Panel Selection Workspace.",
          isAlternativeSelection: vp.selectedCaregiver!.rank !== 1,
        } : undefined,
        matchResults: vp.availableCandidates ? {
          evaluatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          totalCandidatesEvaluated: vp.availableCandidates.length,
          shortlist: vp.availableCandidates,
        } : undefined,
      };
    });

    upsertValidatedCases(casesToStore);
    router.push("/cases-intake");
  };

  const activePatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0] || null;
  }, [patients, selectedPatientId]);

  const totalPatientsCount = patients.length;
  const patientsWithRecommendationsCount = patients.filter((p) => (p.availableCandidates?.length || 0) > 0).length;
  const patientsWithSelectedMatchesCount = patients.filter((p) => p.selectionStatus === "Match Selected" && p.selectedCaregiverId).length;
  const unmatchedCount = patients.filter((p) => p.matchingStatus === "Unmatched").length;
  const needsAttentionCount = patients.filter((p) => p.matchingStatus === "Needs Information" || p.requirementStatus === "Needs Information").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10 font-sans text-[#101828]">
        
        {/* Navigation Breadcrumb back to Overview */}
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
          <div className="flex items-center gap-2 text-[13px] text-[#667085]">
            <Link href="/cases-intake" className="hover:text-[#101828] font-medium transition-colors">
              &larr; Back to Cases Overview
            </Link>
            <span>/</span>
            <span className="text-[#101828] font-semibold">New Referral Intake</span>
          </div>

          {/* Sequential Stage Badge */}
          <div className="flex items-center gap-2 text-[12px] font-mono">
            <span className={`px-2.5 py-1 rounded-md ${step === "upload" || step === "ai_review" || step === "extracted_patients" ? "bg-[#007AFF] text-white font-medium" : "bg-[#34C759] text-white"}`}>
              01 Review Referral
            </span>
            <span className="text-[#D0D5DD]">&rarr;</span>
            <span className={`px-2.5 py-1 rounded-md ${step === "ai_matching" ? "bg-[#007AFF] text-white font-medium" : (step === "matching_results" || step === "validating") ? "bg-[#34C759] text-white" : "bg-[#F2F4F7] text-[#667085]"}`}>
              02 Match Caregivers
            </span>
            <span className="text-[#D0D5DD]">&rarr;</span>
            <span className={`px-2.5 py-1 rounded-md ${step === "matching_results" || step === "validating" ? "bg-[#007AFF] text-white font-medium" : "bg-[#F2F4F7] text-[#667085]"}`}>
              03 Validate Matches
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* STEP 1: INITIAL STATE — REFERRAL UPLOAD DROPZONE ONLY               */}
        {/* ------------------------------------------------------------------ */}
        {step === "upload" && (
          <div className="mx-auto w-full max-w-2xl py-8">
            <div className="text-center mb-6">
              <h1 className="text-[26px] font-semibold text-[#101828]">Upload a care referral</h1>
              <p className="mt-1 text-[14px] text-[#475467]">
                Upload a government referral CSV file to extract patient care requirements and identify suitable caregivers.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-[#D0D5DD] bg-white p-10 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF] mb-4">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <span className="text-[16px] font-semibold text-[#101828] block">
                Drag and drop your referral file here
              </span>
              <span className="mt-1 text-[13px] text-[#667085] block">
                CSV file format (.csv)
              </span>

              <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#007AFF] px-5 py-2.5 text-[14px] font-semibold text-white shadow-xs hover:bg-[#0062CC] transition-colors">
                <span>Browse Files</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVSelect}
                  className="hidden"
                />
              </label>

              <div className="mt-6 border-t border-[#EAECF0] pt-4 text-[12px] text-[#667085]">
                Referral CSV files will be parsed, collated, and verified via AI document review.
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 1: AI REVIEW ANIMATION (~3s per stage)                        */}
        {/* ------------------------------------------------------------------ */}
        {step === "ai_review" && (
          <AIReviewAnimation
            fileName={uploadedFile?.name || "referral_roster.csv"}
            onComplete={handleReviewComplete}
          />
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 1: EXTRACTED PATIENTS REVIEW TABLE                            */}
        {/* ------------------------------------------------------------------ */}
        {step === "extracted_patients" && (
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-[#EAECF0] bg-white shadow-xs overflow-hidden">
              <div className="border-b border-[#EAECF0] p-5 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#101828]">Review Extracted Patients</h2>
                  <p className="text-[13px] text-[#475467] mt-0.5">
                    The following patient records and care requirements were extracted from your referral.
                  </p>
                </div>
                <span className="text-[12px] font-medium text-[#667085] font-mono">
                  Source: {uploadedFile?.name || "referral_roster.csv"} ({patients.length} records)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[14px]">
                  <thead className="border-b border-[#EAECF0] bg-white text-[12px] uppercase font-semibold text-[#667085]">
                    <tr>
                      <th className="py-3 px-5">Patient</th>
                      <th className="py-3 px-4">Care Requirement</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Requirements Status</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECF0]">
                    {patients.map((p) => {
                      const isEditing = editingPatientId === p.id;

                      return (
                        <tr key={p.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3.5 px-5">
                            <span className="font-semibold text-[#101828] block">{p.patientName}</span>
                            <span className="font-mono text-[11px] text-[#667085]">{p.id}</span>
                          </td>
                          <td className="py-3.5 px-4 text-[#344054]">
                            <span className="font-medium text-[#101828]">{p.disciplineNeeded}</span>
                            <span className="text-[12px] text-[#667085] block">{p.hoursPerWeek} hrs/wk</span>
                          </td>
                          <td className="py-3.5 px-4">
                            {isEditing ? (
                              <input
                                type="text"
                                placeholder="Enter ZIP..."
                                value={correctionZip}
                                onChange={(e) => setCorrectionZip(e.target.value)}
                                className="rounded border border-[#D0D5DD] px-2 py-1 text-[12px] w-28"
                              />
                            ) : (
                              <span className="font-mono text-[13px]">
                                {p.zipCode ? `ZIP ${p.zipCode}` : <span className="text-[#FF3B30] font-sans font-medium">Missing ZIP</span>}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              p.requirementStatus === "Complete" ? "bg-[#34C759]/15 text-[#248A3D]" : "bg-[#FF3B30]/10 text-[#FF3B30]"
                            }`}>
                              {p.requirementStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            {isEditing ? (
                              <button
                                type="button"
                                onClick={() => handleSaveCorrection(p.id)}
                                className="rounded bg-[#007AFF] px-2.5 py-1 text-[12px] font-medium text-white"
                              >
                                Save
                              </button>
                            ) : p.requirementStatus === "Needs Information" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPatientId(p.id);
                                  setCorrectionZip(p.zipCode);
                                }}
                                className="text-[12px] font-semibold text-[#007AFF] hover:underline"
                              >
                                Fix Details
                              </button>
                            ) : (
                              <span className="text-[12px] text-[#667085]">Verified</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Stage 1 CTA */}
              <div className="border-t border-[#EAECF0] p-4 bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[13px] text-[#475467]">
                  {needsAttentionCount > 0 ? (
                    <span className="text-[#B26A00] font-medium">
                      Notice: {needsAttentionCount} patient requires missing info before matching.
                    </span>
                  ) : (
                    "All extracted records are verified and eligible for caregiver matching."
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleStartMatching}
                  className="rounded-lg bg-[#007AFF] px-5 py-2.5 text-[14px] font-semibold text-white shadow-xs hover:bg-[#0062CC] transition-colors"
                >
                  Match with Caregivers &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 2: AI CAREGIVER MATCHING ANIMATION (~3s per stage)            */}
        {/* ------------------------------------------------------------------ */}
        {step === "ai_matching" && (
          <AIMatchingAnimation
            patients={patients}
            onComplete={handleMatchingComplete}
          />
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 3: TWO-PANEL INTERACTIVE MATCHING WORKSPACE                   */}
        {/* ------------------------------------------------------------------ */}
        {step === "matching_results" && (
          <div className="flex flex-col gap-6">
            
            {/* Header & Compact Metrics */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#EAECF0] pb-5 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-[26px] font-semibold tracking-tight text-[#101828]">
                  Caregiver Matching
                </h1>
                <p className="mt-1 text-[14px] text-[#475467]">
                  Review extracted patients and select the most suitable caregiver for each care requirement.
                </p>
              </div>

              {/* Compact Metrics Strip */}
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-[#EAECF0] bg-white px-3 py-2 text-right shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-[#667085] block">Total</span>
                  <span className="text-[16px] font-bold text-[#101828]">{totalPatientsCount}</span>
                </div>
                <div className="rounded-lg border border-[#EAECF0] bg-white px-3 py-2 text-right shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-[#007AFF] block">Recommended</span>
                  <span className="text-[16px] font-bold text-[#007AFF]">{patientsWithRecommendationsCount}</span>
                </div>
                <div className="rounded-lg border border-[#EAECF0] bg-white px-3 py-2 text-right shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-[#34C759] block">Selected</span>
                  <span className="text-[16px] font-bold text-[#34C759]">{patientsWithSelectedMatchesCount}</span>
                </div>
                <div className="rounded-lg border border-[#EAECF0] bg-white px-3 py-2 text-right shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-[#FF3B30] block">Unmatched</span>
                  <span className="text-[16px] font-bold text-[#FF3B30]">{unmatchedCount}</span>
                </div>
              </div>
            </div>

            {/* Two-Panel Layout (Left 38% / Right 62%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT PANEL: PATIENT LIST */}
              <div className="lg:col-span-5 rounded-xl border border-[#EAECF0] bg-white shadow-xs overflow-hidden">
                <div className="border-b border-[#EAECF0] px-4 py-3 bg-[#F8FAFC]">
                  <h2 className="text-[14px] font-semibold text-[#101828]">Patients</h2>
                  <p className="text-[12px] text-[#667085]">
                    Select a patient to review their caregiver recommendations.
                  </p>
                </div>

                <div className="divide-y divide-[#EAECF0] max-h-[640px] overflow-y-auto">
                  {patients.map((patient) => {
                    const isSelected = activePatient?.id === patient.id;
                    const candidatesCount = patient.availableCandidates?.length || 0;
                    const selectedCg = patient.availableCandidates?.find(
                      (c: RankedCaregiverMatch) => c.caregiverId === patient.selectedCaregiverId
                    );

                    return (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={`cursor-pointer p-4 transition-all ${
                          isSelected
                            ? "bg-[#007AFF]/5 border-l-4 border-l-[#007AFF]"
                            : "hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[14px] text-[#101828]">
                            {patient.patientName}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              patient.selectionStatus === "Match Selected"
                                ? "bg-[#34C759]/15 text-[#248A3D]"
                                : patient.selectionStatus === "Unmatched"
                                ? "bg-[#F79009]/15 text-[#B26A00]"
                                : patient.selectionStatus === "Needs Information"
                                ? "bg-[#FF3B30]/10 text-[#FF3B30]"
                                : "bg-[#F2F4F7] text-[#667085]"
                            }`}
                          >
                            {patient.selectionStatus || "Awaiting Selection"}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#667085] font-mono">
                          <span>{patient.id}</span>
                          <span>&bull;</span>
                          <span>ZIP {patient.zipCode || "Missing"}</span>
                        </div>

                        <div className="mt-2 text-[13px] text-[#344054]">
                          <span className="font-medium text-[#101828]">{patient.disciplineNeeded}</span>
                          <span className="text-[#667085]"> &bull; {patient.hoursPerWeek} hrs/week</span>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-[#EAECF0]/60">
                          {selectedCg ? (
                            <span className="text-[#248A3D] font-medium truncate">
                              ✓ {selectedCg.name} ({selectedCg.overallScore}%)
                            </span>
                          ) : patient.matchingStatus === "Unmatched" ? (
                            <span className="text-[#B26A00] italic">Zero candidates found</span>
                          ) : (
                            <span className="text-[#FF3B30]">Needs information</span>
                          )}

                          <span className="text-[#007AFF] font-medium shrink-0">
                            {candidatesCount} {candidatesCount === 1 ? "match" : "matches"} &rarr;
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT PANEL: RECOMMENDED CAREGIVERS */}
              <div className="lg:col-span-7 rounded-xl border border-[#EAECF0] bg-white p-5 shadow-xs">
                {activePatient ? (
                  <div className="flex flex-col gap-5">
                    
                    {/* Active Requirement Profile Box */}
                    <div className="rounded-lg border border-[#EAECF0] bg-[#F8FAFC] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                            Active Requirement Profile
                          </span>
                          <h3 className="text-[16px] font-semibold text-[#101828] mt-0.5">
                            {activePatient.patientName} <span className="font-mono text-[12px] text-[#667085]">({activePatient.id})</span>
                          </h3>
                        </div>

                        <span className="rounded bg-white px-2.5 py-1 text-[12px] font-medium border border-[#EAECF0] text-[#101828]">
                          ZIP {activePatient.zipCode || "Missing"} &bull; {activePatient.hoursPerWeek} hrs/wk
                        </span>
                      </div>

                      <p className="mt-2 text-[12px] text-[#475467]">
                        {activePatient.clinicalDirectives}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                        <span className="rounded bg-white px-2 py-0.5 border border-[#EAECF0] text-[#101828]">
                          Discipline: <strong>{activePatient.disciplineNeeded}</strong>
                        </span>
                        <span className="rounded bg-white px-2 py-0.5 border border-[#EAECF0] text-[#101828]">
                          Policy: <strong>{activePatient.nonSmokingHousehold ? "Non-Smoker Household" : "No Smoking Restrictions"}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="border-b border-[#EAECF0] pb-2 flex items-center justify-between">
                      <div>
                        <h3 className="text-[15px] font-semibold text-[#101828]">
                          Recommended Caregivers
                        </h3>
                        <p className="text-[12px] text-[#667085]">
                          Caregivers ranked by suitability for {activePatient.patientName}&apos;s requirements.
                        </p>
                      </div>

                      <span className="text-[12px] font-medium text-[#007AFF]">
                        {activePatient.availableCandidates?.length || 0} Evaluated
                      </span>
                    </div>

                    {/* Unmatched State */}
                    {activePatient.matchingStatus === "Unmatched" && (
                      <div className="rounded-xl border border-[#F79009]/30 bg-[#F79009]/5 p-6 text-center">
                        <span className="text-[14px] font-semibold text-[#B26A00] block">
                          No Eligible Caregiver Identified
                        </span>
                        <p className="text-[12px] text-[#475467] mt-1 max-w-md mx-auto">
                          {activePatient.unmatchedReason || "Zero active caregivers satisfied both mandatory discipline, commute perimeter, and household policies."}
                        </p>
                        <span className="inline-block mt-3 text-[11px] text-[#667085]">
                          This patient will remain unresolved and will be excluded from the bulk validation action.
                        </span>
                      </div>
                    )}

                    {/* Needs Information State */}
                    {activePatient.matchingStatus === "Needs Information" && (
                      <div className="rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/5 p-6 text-center">
                        <span className="text-[14px] font-semibold text-[#FF3B30] block">
                          Missing Information Prevents Reliable Matching
                        </span>
                        <p className="text-[12px] text-[#475467] mt-1">
                          Mandatory parameters (such as Patient ZIP Code) are missing.
                        </p>
                        <button
                          type="button"
                          onClick={() => setStep("extracted_patients")}
                          className="mt-3 text-[12px] font-semibold text-[#007AFF] hover:underline"
                        >
                          &larr; Return to Extracted Patients to fill missing details
                        </button>
                      </div>
                    )}

                    {/* Caregiver Cards */}
                    {activePatient.availableCandidates && activePatient.availableCandidates.length > 0 && (
                      <div className="space-y-3">
                        <AnimatePresence>
                          {activePatient.availableCandidates.map((candidate: RankedCaregiverMatch) => {
                            const isChosenMatch = activePatient.selectedCaregiverId === candidate.caregiverId;
                            const isDefaultRankOne = candidate.rank === 1;

                            return (
                              <motion.div
                                key={candidate.caregiverId}
                                layout
                                onClick={() => handleSelectCaregiverForPatient(activePatient.id, candidate)}
                                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                                  isChosenMatch
                                    ? "border-[#007AFF] bg-white ring-2 ring-[#007AFF]/15 shadow-sm"
                                    : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                                        isChosenMatch
                                          ? "border-[#007AFF] bg-[#007AFF]"
                                          : "border-[#D0D5DD] bg-white"
                                      }`}>
                                        {isChosenMatch && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                      </div>
                                    </div>

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-[15px] text-[#101828]">
                                          {candidate.name}
                                        </span>
                                        {isChosenMatch && (
                                          <span className="rounded-full bg-[#007AFF]/10 px-2 py-0.5 text-[10px] font-bold text-[#007AFF]">
                                            Selected Match
                                          </span>
                                        )}
                                        {isDefaultRankOne && !isChosenMatch && (
                                          <span className="rounded-full bg-[#F2F4F7] px-2 py-0.5 text-[10px] font-medium text-[#667085]">
                                            Top Recommended (#1)
                                          </span>
                                        )}
                                      </div>

                                      <div className="mt-1 flex flex-wrap gap-2 text-[12px] text-[#667085]">
                                        <span>{candidate.discipline}</span>
                                        <span>&bull;</span>
                                        <span>{candidate.commute.distanceMiles} mi ({candidate.commute.driveTimeMinutes} min via Azure Maps)</span>
                                        <span>&bull;</span>
                                        <span className="text-[#007AFF] font-medium">Voice AI: {candidate.voiceScreeningScore}/5.0</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="text-[20px] font-bold text-[#007AFF]">
                                      {candidate.overallScore}%
                                    </span>
                                    <span className="block text-[10px] uppercase font-semibold text-[#667085]">
                                      Match Score
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {candidate.certifications.map((cert) => (
                                    <span key={cert} className="rounded bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-[#344054] border border-[#EAECF0]">
                                      {cert}
                                    </span>
                                  ))}
                                </div>

                                <div className="mt-3 rounded-lg bg-[#F8FAFC] p-3 text-[12px] text-[#475467] border border-[#EAECF0]">
                                  <strong className="text-[#101828] block mb-1">Matching Rationale:</strong>
                                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                                    {candidate.matchRationale.map((rationale, rIdx) => (
                                      <li key={rIdx}>{rationale}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="mt-3 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectCaregiverForPatient(activePatient.id, candidate);
                                    }}
                                    className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
                                      isChosenMatch
                                        ? "bg-[#007AFF] text-white cursor-default"
                                        : "bg-white border border-[#D0D5DD] text-[#344054] hover:bg-[#F2F4F7]"
                                    }`}
                                  >
                                    {isChosenMatch ? "✓ Active Selected Match" : "Select as Match"}
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="py-20 text-center text-[#667085]">
                    Select a patient on the left to inspect recommended caregivers.
                  </div>
                )}
              </div>

            </div>

            {/* Persistent Validation Action Bar */}
            <div className="rounded-xl border border-[#EAECF0] bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[13px] text-[#475467]">
                <span>Total Patients: <strong className="text-[#101828]">{totalPatientsCount}</strong></span>
                <span className="mx-2 text-[#D0D5DD]">&bull;</span>
                <span>Selected Pairings: <strong className="text-[#34C759]">{patientsWithSelectedMatchesCount}</strong></span>
                <span className="mx-2 text-[#D0D5DD]">&bull;</span>
                <span>Unmatched: <strong className="text-[#F79009]">{unmatchedCount}</strong></span>
                {needsAttentionCount > 0 && (
                  <>
                    <span className="mx-2 text-[#D0D5DD]">&bull;</span>
                    <span>Needs Attention: <strong className="text-[#FF3B30]">{needsAttentionCount}</strong></span>
                  </>
                )}
              </div>

              <button
                type="button"
                disabled={patientsWithSelectedMatchesCount === 0 || isSubmittingValidation}
                onClick={() => setIsValidationConfirmOpen(true)}
                className="rounded-lg bg-[#34C759] px-6 py-2.5 text-[14px] font-semibold text-white shadow-xs hover:bg-[#2EB04E] transition-colors disabled:opacity-40"
              >
                Validate All Matches ({patientsWithSelectedMatchesCount})
              </button>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 4: DEDICATED FULL-PAGE VALIDATION ANIMATION SCREEN            */}
        {/* ------------------------------------------------------------------ */}
        {step === "validating" && (
          <ValidationProcessScreen
            patients={patients}
            onValidationSuccess={handleValidationCompleteAndRedirect}
            onCancelOrRetry={() => {
              setIsSubmittingValidation(false);
              setStep("matching_results");
            }}
          />
        )}

        {/* ================================================================== */}
        {/* CONFIRMATION VALIDATION MODAL                                      */}
        {/* ================================================================== */}
        {isValidationConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl border border-[#EAECF0] bg-white p-6 shadow-xl">
              <h3 className="text-[18px] font-semibold text-[#101828]">
                Confirm caregiver matches?
              </h3>
              <p className="mt-2 text-[13px] text-[#475467] leading-relaxed">
                You are about to validate the selected caregiver pairings for <strong>{patientsWithSelectedMatchesCount} patients</strong>.{" "}
                {unmatchedCount + needsAttentionCount > 0 ? (
                  <span>
                    <strong>{unmatchedCount + needsAttentionCount} patients</strong> have no selected caregiver and will remain unresolved.
                  </span>
                ) : (
                  "All patients have valid selected pairings."
                )}
              </p>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsValidationConfirmOpen(false)}
                  className="rounded-lg border border-[#D0D5DD] px-4 py-2 text-[13px] font-medium text-[#344054] hover:bg-[#F2F4F7]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingValidation}
                  onClick={handleInitiateValidation}
                  className="rounded-lg bg-[#34C759] px-4 py-2 text-[13px] font-semibold text-white shadow-xs hover:bg-[#2EB04E] disabled:opacity-50"
                >
                  {isSubmittingValidation ? "Validating..." : "Confirm Validation"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}