// lib/cases-intake-service.ts
import { 
  CaseIntakeRecord, 
  ReferralBatchRecord, 
  RankedCaregiverMatch, 
  HardRuleCheck,
  BatchWorkflowStatus 
} from "../types/cases-intake";

export const MOCK_CAREGIVERS_POOL = [
  {
    id: "CG-101",
    name: "Eleanor Vance, RN",
    discipline: "Registered Nurse (RN)",
    zipCode: "15213",
    isSmoker: false,
    activeCertifications: ["Wound Care Certified (WCC)", "BLS", "ACLS"],
    voiceScreeningScore: 4.8,
    voiceSummary: "Exceptional wound VAC protocol expertise, empathetic patient pacing, and verified clinical communication.",
    commuteDistanceMiles: 4.2,
    commuteMinutes: 12,
  },
  {
    id: "CG-102",
    name: "Marcus Sterling, RN",
    discipline: "Registered Nurse (RN)",
    zipCode: "15228",
    isSmoker: false,
    activeCertifications: ["Registered Nurse (RN)", "BLS"],
    voiceScreeningScore: 4.3,
    voiceSummary: "Solid IV therapy and surgical recovery background. High schedule flexibility across evening hours.",
    commuteDistanceMiles: 8.7,
    commuteMinutes: 21,
  },
  {
    id: "CG-103",
    name: "Dana Kowalski, RN",
    discipline: "Registered Nurse (RN)",
    zipCode: "15237",
    isSmoker: true,
    activeCertifications: ["Wound Care Certified (WCC)", "Registered Nurse (RN)"],
    voiceScreeningScore: 4.5,
    voiceSummary: "Extensive geriatric rehabilitation expertise.",
    commuteDistanceMiles: 16.5,
    commuteMinutes: 34,
  },
  {
    id: "CG-104",
    name: "Jerome Bell, PT",
    discipline: "Physical Therapist (PT)",
    zipCode: "15206",
    isSmoker: false,
    activeCertifications: ["Doctor of Physical Therapy", "Geriatric Clinical Specialist"],
    voiceScreeningScore: 4.7,
    voiceSummary: "Outstanding communicative rapport and gait retraining track record.",
    commuteDistanceMiles: 5.1,
    commuteMinutes: 14,
  },
  {
    id: "CG-105",
    name: "Rosa Mendez, HHA",
    discipline: "Home Health Aide (HHA)",
    zipCode: "15219",
    isSmoker: false,
    activeCertifications: ["Certified Nursing Assistant (CNA)", "First Aid / CPR"],
    voiceScreeningScore: 4.6,
    voiceSummary: "Experienced dementia care aide with bilingual Spanish/English fluency and verified transport reliability.",
    commuteDistanceMiles: 6.3,
    commuteMinutes: 18,
  }
];

export function runAutomatedMatchEngine(record: CaseIntakeRecord): CaseIntakeRecord {
  const missing: string[] = [];
  if (!record.zipCode) missing.push("Patient ZIP Code");
  if (!record.disciplineNeeded) missing.push("Required Discipline");
  if (!record.patientName) missing.push("Patient Name");

  if (missing.length > 0) {
    return {
      ...record,
      status: "Needs Information",
      missingFields: missing,
      matchResults: undefined,
    };
  }

  const candidates: RankedCaregiverMatch[] = MOCK_CAREGIVERS_POOL.map((cg) => {
    const disciplinePassed = cg.discipline.toLowerCase() === record.disciplineNeeded.toLowerCase();
    const smokePassed = !record.nonSmokingHousehold || !cg.isSmoker;
    const distancePassed = cg.commuteDistanceMiles <= 20;

    const hardRules: HardRuleCheck[] = [
      {
        id: "hr-disc",
        label: "Discipline Match",
        passed: disciplinePassed,
        requirementValue: record.disciplineNeeded,
        candidateValue: cg.discipline,
        failureReason: disciplinePassed ? undefined : `Candidate is ${cg.discipline}, requires ${record.disciplineNeeded}`,
      },
      {
        id: "hr-smoke",
        label: "Smoking Restrictions",
        passed: smokePassed,
        requirementValue: record.nonSmokingHousehold ? "Strict Non-Smoking" : "No Restriction",
        candidateValue: cg.isSmoker ? "Active Smoker" : "Non-Smoker",
        failureReason: smokePassed ? undefined : "Candidate is an active smoker for a smoke-free household",
      },
      {
        id: "hr-commute",
        label: "Commute Perimeter",
        passed: distancePassed,
        requirementValue: "< 20 Miles",
        candidateValue: `${cg.commuteDistanceMiles} miles`,
        failureReason: distancePassed ? undefined : "Commute exceeds maximum 20-mile operational radius",
      },
    ];

    const allPassed = hardRules.every((r) => r.passed);
    let score = 0;
    if (allPassed) {
      const commuteBonus = Math.max(0, 30 - cg.commuteMinutes);
      const voiceBonus = (cg.voiceScreeningScore / 5) * 40;
      score = Math.min(99, Math.round(30 + commuteBonus + voiceBonus));
    }

    return {
      caregiverId: cg.id,
      name: cg.name,
      discipline: cg.discipline,
      overallScore: score,
      rank: 0,
      allHardRulesPassed: allPassed,
      hardRules,
      commute: {
        distanceMiles: cg.commuteDistanceMiles,
        driveTimeMinutes: cg.commuteMinutes,
        originZip: cg.zipCode,
        destinationZip: record.zipCode,
        trafficBand: cg.commuteMinutes > 20 ? "Moderate" : "Light" as "Light" | "Moderate" | "Heavy",
      },
      certifications: cg.activeCertifications,
      voiceScreeningScore: cg.voiceScreeningScore,
      voiceSummary: cg.voiceSummary,
      matchRationale: allPassed ? [
        "Passed all mandatory clinical and territory hard rules",
        `Estimated commute: ${cg.commuteMinutes} min drive via Azure Maps`,
        `AI Voice Verified Clinical Aptitude: ${cg.voiceScreeningScore}/5.0`
      ] : ["Ineligible: Failed mandatory criteria"],
    };
  })
  .filter((c) => c.allHardRulesPassed)
  .sort((a, b) => b.overallScore - a.overallScore)
  .map((c, idx) => ({ ...c, rank: idx + 1 }));

  if (candidates.length === 0) {
    return {
      ...record,
      status: "Unmatched",
      matchResults: {
        evaluatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        totalCandidatesEvaluated: MOCK_CAREGIVERS_POOL.length,
        shortlist: [],
        unmatchedReason: "No active caregivers satisfied both mandatory discipline, territory boundary, and household restrictions.",
      },
    };
  }

  return {
    ...record,
    status: "Pending Review",
    missingFields: [],
    matchResults: {
      evaluatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      totalCandidatesEvaluated: MOCK_CAREGIVERS_POOL.length,
      shortlist: candidates,
    },
  };
}

export function computeBatchStatus(cases: CaseIntakeRecord[]): BatchWorkflowStatus {
  if (cases.length === 0) return "Uploaded";
  const validatedCount = cases.filter((c) => c.status === "Validated").length;
  const needsInfoCount = cases.filter((c) => c.status === "Needs Information").length;
  const pendingReviewCount = cases.filter((c) => c.status === "Pending Review").length;

  if (needsInfoCount > 0 && validatedCount === 0 && pendingReviewCount === 0) return "Needs Attention";
  if (validatedCount === cases.length) return "Completed";
  if (validatedCount > 0) return "Partially Validated";
  if (pendingReviewCount > 0) return "Awaiting Validation";
  return "Matching";
}

export const INITIAL_BATCHES: ReferralBatchRecord[] = [
  {
    id: "BATCH-2026-088",
    fileName: "keystone_intake_referrals_q4.xlsx",
    fileSize: "1.4 MB",
    uploadedAt: "2026-11-09 09:30",
    uploadedBy: "Sarah Lin (Intake Coordinator)",
    referralSource: "Keystone Health Plan",
    totalRequirements: 3,
    status: "Awaiting Validation",
    cases: [
      {
        id: "CASE-2026-901",
        batchId: "BATCH-2026-088",
        sourceFile: "keystone_intake_referrals_q4.xlsx",
        dateIngested: "2026-11-09 09:31",
        referralSource: "Keystone Health Plan",
        patientName: "Harold Jenkins",
        dob: "1954-08-14",
        zipCode: "15213",
        disciplineNeeded: "Registered Nurse (RN)",
        hoursPerWeek: 16,
        nonSmokingHousehold: true,
        clinicalDirectives: "Post-op wound VAC irrigation and weekly dressing change protocol.",
        status: "Pending Review",
        missingFields: [],
        matchResults: {
          evaluatedAt: "2026-11-09 09:32",
          totalCandidatesEvaluated: 5,
          shortlist: [
            {
              caregiverId: "CG-101",
              name: "Eleanor Vance, RN",
              discipline: "Registered Nurse (RN)",
              overallScore: 96,
              rank: 1,
              allHardRulesPassed: true,
              hardRules: [
                { id: "hr-1", label: "Discipline Match", passed: true, requirementValue: "Registered Nurse (RN)", candidateValue: "Registered Nurse (RN)" },
                { id: "hr-2", label: "Non-Smoking Policy", passed: true, requirementValue: "Non-Smoker Required", candidateValue: "Non-Smoker" },
                { id: "hr-3", label: "Territory Proximity", passed: true, requirementValue: "ZIP 15213 (<20 mi)", candidateValue: "4.2 mi away" }
              ],
              commute: { distanceMiles: 4.2, driveTimeMinutes: 12, originZip: "15213", destinationZip: "15213", trafficBand: "Light" },
              certifications: ["Wound Care Certified (WCC)", "BLS", "ACLS"],
              voiceScreeningScore: 4.8,
              voiceSummary: "Exceptional wound VAC protocol expertise, empathetic patient pacing, and verified clinical communication.",
              matchRationale: [
                "Exact certification match for wound VAC irrigation protocol",
                "Optimal geographic proximity (12 min drive)",
                "Top tier AI voice communication score (4.8/5.0)"
              ]
            },
            {
              caregiverId: "CG-102",
              name: "Marcus Sterling, RN",
              discipline: "Registered Nurse (RN)",
              overallScore: 84,
              rank: 2,
              allHardRulesPassed: true,
              hardRules: [
                { id: "hr-1", label: "Discipline Match", passed: true, requirementValue: "Registered Nurse (RN)", candidateValue: "Registered Nurse (RN)" },
                { id: "hr-2", label: "Non-Smoking Policy", passed: true, requirementValue: "Non-Smoker Required", candidateValue: "Non-Smoker" },
                { id: "hr-3", label: "Territory Proximity", passed: true, requirementValue: "ZIP 15213 (<20 mi)", candidateValue: "8.7 mi away" }
              ],
              commute: { distanceMiles: 8.7, driveTimeMinutes: 21, originZip: "15228", destinationZip: "15213", trafficBand: "Moderate" },
              certifications: ["Registered Nurse (RN)", "BLS"],
              voiceScreeningScore: 4.3,
              voiceSummary: "Solid IV therapy and surgical recovery background. High schedule flexibility across evening hours.",
              matchRationale: [
                "Full active licensure and BLS certified",
                "Acceptable commute radius (21 min drive)",
                "Lacks specific advanced wound VAC sub-certification"
              ]
            }
          ]
        }
      },
      {
        id: "CASE-2026-902",
        batchId: "BATCH-2026-088",
        sourceFile: "keystone_intake_referrals_q4.xlsx",
        dateIngested: "2026-11-09 09:31",
        referralSource: "Keystone Health Plan",
        patientName: "Beatrice Morales",
        dob: "1962-03-29",
        zipCode: "",
        disciplineNeeded: "Home Health Aide (HHA)",
        hoursPerWeek: 20,
        nonSmokingHousehold: false,
        clinicalDirectives: "Bathing assistance, meal prep, and transfer oversight.",
        status: "Needs Information",
        missingFields: ["Patient ZIP Code", "Authorized Start Date"],
      },
      {
        id: "CASE-2026-903",
        batchId: "BATCH-2026-088",
        sourceFile: "keystone_intake_referrals_q4.xlsx",
        dateIngested: "2026-11-09 09:31",
        referralSource: "Keystone Health Plan",
        patientName: "Walter G. Henderson",
        dob: "1948-11-02",
        zipCode: "15206",
        disciplineNeeded: "Physical Therapist (PT)",
        hoursPerWeek: 6,
        nonSmokingHousehold: true,
        clinicalDirectives: "Post-stroke mobility reconditioning and bilateral cane gait transition.",
        status: "Pending Review",
        missingFields: [],
        matchResults: {
          evaluatedAt: "2026-11-09 09:33",
          totalCandidatesEvaluated: 5,
          shortlist: [
            {
              caregiverId: "CG-104",
              name: "Jerome Bell, PT",
              discipline: "Physical Therapist (PT)",
              overallScore: 94,
              rank: 1,
              allHardRulesPassed: true,
              hardRules: [
                { id: "hr-1", label: "Discipline Match", passed: true, requirementValue: "Physical Therapist (PT)", candidateValue: "Physical Therapist (PT)" },
                { id: "hr-2", label: "Non-Smoking Policy", passed: true, requirementValue: "Non-Smoker Required", candidateValue: "Non-Smoker" },
                { id: "hr-3", label: "Territory Proximity", passed: true, requirementValue: "ZIP 15206 (<20 mi)", candidateValue: "5.1 mi away" }
              ],
              commute: { distanceMiles: 5.1, driveTimeMinutes: 14, originZip: "15206", destinationZip: "15206", trafficBand: "Light" },
              certifications: ["Doctor of Physical Therapy", "Geriatric Clinical Specialist"],
              voiceScreeningScore: 4.7,
              voiceSummary: "Outstanding communicative rapport and gait retraining track record.",
              matchRationale: [
                "Board Certified Geriatric Clinical Specialist",
                "Immediate proximity within East Liberty corridor (14 min drive)",
                "Full alignment on non-smoking household policy"
              ]
            }
          ]
        }
      }
    ]
  }
];