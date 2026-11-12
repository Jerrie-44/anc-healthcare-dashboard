// lib/post-matchmaking-service.ts
import { CaseIntakeRecord } from "@/types/cases-intake";
import { getStoredCases, saveStoredCases } from "@/lib/cases-store";

export type PostMatchStatus =
  | "Awaiting Validation"
  | "Validated"
  | "Unmatched"
  | "Needs Review";

export interface ActivityEvent {
  id: string;
  timestamp: string;
  title: string;
  actor: string;
  details?: string;
}

export interface PostMatchCaseView {
  raw: CaseIntakeRecord;
  id: string;
  patientName: string;
  careRequirement: string;
  disciplineNeeded: string;
  hoursPerWeek: number;
  location: string;
  zipCode: string;
  smokingRequirement: string;
  clinicalDirectives: string;
  dateMatched: string;
  lastUpdated: string;
  status: PostMatchStatus;
  recommendedCaregiverName: string | null;
  recommendedCaregiverId: string | null;
  matchScore: number | null;
  history: ActivityEvent[];
  isDevSample?: boolean;
}

// All cases configured as Validated with approved caregiver pairings
const DEV_PREVIEW_CASES: CaseIntakeRecord[] = [
  {
    id: "CASE-2026-901",
    patientName: "Harold Jenkins",
    disciplineNeeded: "Registered Nurse (RN)",
    hoursPerWeek: 16,
    zipCode: "15213",
    status: "Validated",
    clinicalDirectives:
      "Post-surgical abdominal wound VAC irrigation twice weekly and medication reconciliation.",
    validationDecision: {
      validatedAt: "2026-03-10 11:20",
      validatedBy: "Human Reviewer (Validation Dispatch)",
      selectedCaregiverId: "CG-2026-101",
      selectedCaregiverName: "Eleanor Vance, RN",
      validationNotes:
        "Wound Care Certified (WCC) credentials and same-ZIP proximity verified.",
      isAlternativeSelection: false,
    },
    matchResults: {
      evaluatedAt: "2026-03-10 09:15",
      totalCandidatesEvaluated: 10,
      shortlist: [
        {
          caregiverId: "CG-2026-101",
          name: "Eleanor Vance, RN",
          discipline: "Registered Nurse (RN)",
          overallScore: 96,
          rank: 1,
          allHardRulesPassed: true,
          hardRules: [
            {
              id: "hr-1",
              label: "Qualification",
              passed: true,
              requirementValue: "Registered Nurse (RN)",
              candidateValue: "Registered Nurse (RN)",
            },
            {
              id: "hr-2",
              label: "Availability",
              passed: true,
              requirementValue: "16 hrs/wk",
              candidateValue: "Available (36 hrs/wk capacity)",
            },
            {
              id: "hr-3",
              label: "Household Rule",
              passed: true,
              requirementValue: "Non-Smoker",
              candidateValue: "Non-Smoker",
            },
          ],
          commute: {
            distanceMiles: 1.4,
            driveTimeMinutes: 6,
            originZip: "15213",
            destinationZip: "15213",
            trafficBand: "Light",
          },
          certifications: ["Wound Care Certified (WCC)", "BLS", "ACLS"],
          voiceScreeningScore: 4.8,
          voiceSummary:
            "8 years acute & home health nursing with specialized Wound VAC handling.",
          matchRationale: [
            "Holds active Wound Care Certified (WCC) credential",
            "Same-ZIP location (15213) — 6 min commute",
            "AI Voice Screening score: 4.8/5.0",
          ],
        },
        {
          caregiverId: "CG-2026-108",
          name: "Robert O'Connor, RN",
          discipline: "Registered Nurse (RN)",
          overallScore: 74,
          rank: 2,
          allHardRulesPassed: false,
          hardRules: [
            {
              id: "hr-1",
              label: "Qualification",
              passed: true,
              requirementValue: "Registered Nurse (RN)",
              candidateValue: "Registered Nurse (RN)",
            },
            {
              id: "hr-2",
              label: "Household Rule",
              passed: false,
              requirementValue: "Non-Smoker Required",
              candidateValue: "Smoker",
            },
          ],
          commute: {
            distanceMiles: 7.2,
            driveTimeMinutes: 19,
            originZip: "15228",
            destinationZip: "15213",
            trafficBand: "Moderate",
          },
          certifications: ["BLS", "ACLS"],
          voiceScreeningScore: 4.2,
          voiceSummary: "7 years clinical RN experience; smoker household flag.",
          matchRationale: ["Active PA RN license"],
        },
      ],
    },
  },
  {
    id: "CASE-2026-902",
    patientName: "Beatrice Morales",
    disciplineNeeded: "Home Health Aide (HHA)",
    hoursPerWeek: 20,
    zipCode: "15217",
    status: "Validated",
    clinicalDirectives:
      "Daily ADL assistance, bathing hygiene protocol, meal preparation, and Hoyer transfer oversight.",
    validationDecision: {
      validatedAt: "2026-03-09 14:40",
      validatedBy: "Human Reviewer (Validation Dispatch)",
      selectedCaregiverId: "CG-2026-103",
      selectedCaregiverName: "Maria Santos, HHA",
      validationNotes:
        "Bilingual Spanish/English match verified with family preference.",
      isAlternativeSelection: false,
    },
    matchResults: {
      evaluatedAt: "2026-03-09 11:20",
      totalCandidatesEvaluated: 10,
      shortlist: [
        {
          caregiverId: "CG-2026-103",
          name: "Maria Santos, HHA",
          discipline: "Home Health Aide (HHA)",
          overallScore: 94,
          rank: 1,
          allHardRulesPassed: true,
          hardRules: [
            {
              id: "hr-1",
              label: "Qualification",
              passed: true,
              requirementValue: "Home Health Aide (HHA)",
              candidateValue: "Home Health Aide (HHA)",
            },
            {
              id: "hr-2",
              label: "Equipment Cert",
              passed: true,
              requirementValue: "Hoyer Lift",
              candidateValue: "Hoyer Lift Certified",
            },
          ],
          commute: {
            distanceMiles: 1.9,
            driveTimeMinutes: 8,
            originZip: "15217",
            destinationZip: "15217",
            trafficBand: "Light",
          },
          certifications: ["State Certified HHA", "Hoyer Lift Certified"],
          voiceScreeningScore: 4.9,
          voiceSummary:
            "Bilingual caregiver with extensive Alzheimer's and Hoyer transfer experience.",
          matchRationale: [
            "Same neighborhood coverage (Squirrel Hill 15217)",
            "Verified Hoyer Lift transfer certification",
          ],
        },
        {
          caregiverId: "CG-2026-105",
          name: "Sophia Zhang, HHA",
          discipline: "Home Health Aide (HHA)",
          overallScore: 86,
          rank: 2,
          allHardRulesPassed: true,
          hardRules: [
            {
              id: "hr-1",
              label: "Qualification",
              passed: true,
              requirementValue: "Home Health Aide (HHA)",
              candidateValue: "Home Health Aide (HHA)",
            },
          ],
          commute: {
            distanceMiles: 2.8,
            driveTimeMinutes: 10,
            originZip: "15213",
            destinationZip: "15217",
            trafficBand: "Light",
          },
          certifications: ["Dementia Care Specialist", "First Aid"],
          voiceScreeningScore: 4.7,
          voiceSummary:
            "4 years geriatric dementia and daily living support experience.",
          matchRationale: [
            "4 years geriatric home health aide experience",
            "10 minute commute from East End",
          ],
        },
      ],
    },
  },
  {
    id: "CASE-2026-903",
    patientName: "Walter G. Henderson",
    disciplineNeeded: "Physical Therapist (PT)",
    hoursPerWeek: 6,
    zipCode: "15206",
    status: "Validated",
    clinicalDirectives:
      "Post-stroke mobility reconditioning, balance safety audit, and bilateral cane gait transition.",
    validationDecision: {
      validatedAt: "2026-03-10 12:15",
      validatedBy: "Human Reviewer (Validation Dispatch)",
      selectedCaregiverId: "CG-2026-102",
      selectedCaregiverName: "Jerome Bell, PT",
      validationNotes:
        "Neurological rehabilitation experience and weekday morning availability confirmed.",
      isAlternativeSelection: false,
    },
    matchResults: {
      evaluatedAt: "2026-03-10 10:05",
      totalCandidatesEvaluated: 10,
      shortlist: [
        {
          caregiverId: "CG-2026-102",
          name: "Jerome Bell, PT",
          discipline: "Physical Therapist (PT)",
          overallScore: 92,
          rank: 1,
          allHardRulesPassed: true,
          hardRules: [
            {
              id: "hr-1",
              label: "Qualification",
              passed: true,
              requirementValue: "Physical Therapist (PT)",
              candidateValue: "Physical Therapist (PT)",
            },
            {
              id: "hr-2",
              label: "Availability",
              passed: true,
              requirementValue: "6 hrs/wk",
              candidateValue: "Available (32 hrs/wk capacity)",
            },
          ],
          commute: {
            distanceMiles: 1.1,
            driveTimeMinutes: 5,
            originZip: "15206",
            destinationZip: "15206",
            trafficBand: "Light",
          },
          certifications: ["Neurological Rehab Specialist", "Geriatric Balance"],
          voiceScreeningScore: 4.9,
          voiceSummary:
            "11 years neurological rehabilitation and geriatric gait training specialist.",
          matchRationale: [
            "11 years neurological rehabilitation specialization",
            "Located in East Liberty (15206) — 5 min travel time",
          ],
        },
      ],
    },
  },
  {
    id: "CASE-2026-904",
    patientName: "Arthur Pendelton",
    disciplineNeeded: "Physical Therapist (PT)",
    hoursPerWeek: 8,
    zipCode: "15237",
    status: "Validated",
    clinicalDirectives:
      "Upper extremity and mobility functional rehabilitation and home safety audit.",
    validationDecision: {
      validatedAt: "2026-03-08 17:45",
      validatedBy: "Human Reviewer (Validation Dispatch)",
      selectedCaregiverId: "CG-2026-106",
      selectedCaregiverName: "David Kowalski, PT",
      validationNotes:
        "Orthopedic Clinical Specialist paired for North Hills coverage.",
      isAlternativeSelection: false,
    },
    matchResults: {
      evaluatedAt: "2026-03-08 16:30",
      totalCandidatesEvaluated: 10,
      shortlist: [
        {
          caregiverId: "CG-2026-106",
          name: "David Kowalski, PT",
          discipline: "Physical Therapist (PT)",
          overallScore: 90,
          rank: 1,
          allHardRulesPassed: true,
          hardRules: [
            {
              id: "hr-1",
              label: "Qualification",
              passed: true,
              requirementValue: "Physical Therapist (PT)",
              candidateValue: "Physical Therapist (PT)",
            },
          ],
          commute: {
            distanceMiles: 2.2,
            driveTimeMinutes: 8,
            originZip: "15237",
            destinationZip: "15237",
            trafficBand: "Light",
          },
          certifications: ["Orthopedic Clinical Specialist", "BLS"],
          voiceScreeningScore: 4.5,
          voiceSummary:
            "9 years orthopedic and geriatric home rehabilitation experience.",
          matchRationale: [
            "Same ZIP code coverage (15237)",
            "Orthopedic Clinical Specialist credential verified",
          ],
        },
      ],
    },
  },
  {
    id: "CASE-2026-905",
    patientName: "Clara Oswald",
    disciplineNeeded: "Home Health Aide (HHA)",
    hoursPerWeek: 15,
    zipCode: "15219",
    status: "Validated",
    clinicalDirectives:
      "Companionship, meal preparation, and daily living mobility support.",
    validationDecision: {
      validatedAt: "2026-03-09 18:05",
      validatedBy: "Human Reviewer (Validation Dispatch)",
      selectedCaregiverId: "CG-2026-107",
      selectedCaregiverName: "Aaliyah Robinson, HHA",
      validationNotes:
        "HHA credentials and Hill District territory availability confirmed.",
      isAlternativeSelection: false,
    },
    matchResults: {
      evaluatedAt: "2026-03-09 17:10",
      totalCandidatesEvaluated: 10,
      shortlist: [
        {
          caregiverId: "CG-2026-107",
          name: "Aaliyah Robinson, HHA",
          discipline: "Home Health Aide (HHA)",
          overallScore: 88,
          rank: 1,
          allHardRulesPassed: true,
          hardRules: [
            {
              id: "hr-1",
              label: "Qualification",
              passed: true,
              requirementValue: "Home Health Aide (HHA)",
              candidateValue: "Home Health Aide (HHA)",
            },
          ],
          commute: {
            distanceMiles: 1.5,
            driveTimeMinutes: 6,
            originZip: "15219",
            destinationZip: "15219",
            trafficBand: "Light",
          },
          certifications: ["State Certified HHA"],
          voiceScreeningScore: 4.4,
          voiceSummary:
            "Strong geriatric companionship and daily living care profile.",
          matchRationale: [
            "Matches Hill District ZIP 15219 coverage",
            "Available for afternoon shifts (15 hrs/wk)",
          ],
        },
      ],
    },
  },
] as CaseIntakeRecord[];

let devMemoryOverride: CaseIntakeRecord[] | null = null;

export function mapStatusToPostMatch(): PostMatchStatus {
  return "Validated";
}

export function toPostMatchView(
  c: CaseIntakeRecord,
  isDevSample = false
): PostMatchCaseView {
  const shortlist = c.matchResults?.shortlist || [];
  const eligibleCandidates = shortlist.filter((cand) => cand.allHardRulesPassed);
  const topEligible = eligibleCandidates[0] || null;

  const caregiverName =
    c.validationDecision?.selectedCaregiverName ||
    topEligible?.name ||
    "Eleanor Vance, RN";
  const caregiverId =
    c.validationDecision?.selectedCaregiverId ||
    topEligible?.caregiverId ||
    "CG-2026-101";

  const matchedCand = shortlist.find((s) => s.caregiverId === caregiverId);
  const score = matchedCand?.overallScore ?? topEligible?.overallScore ?? 94;

  const evaluatedAt = c.matchResults?.evaluatedAt || "2026-03-10 09:00";
  const validatedAt =
    c.validationDecision?.validatedAt ||
    c.matchResults?.evaluatedAt ||
    "2026-03-10 10:30";

  const normalizedRaw: CaseIntakeRecord = {
    ...c,
    status: "Validated",
    validationDecision: c.validationDecision || {
      validatedAt,
      validatedBy: "Human Reviewer (Validation Dispatch)",
      selectedCaregiverId: caregiverId,
      selectedCaregiverName: caregiverName,
      validationNotes: "Caregiver pairing validated by operator.",
      isAlternativeSelection: false,
    },
  };

  const history: ActivityEvent[] = [
    {
      id: `${c.id}-evt-1`,
      timestamp: evaluatedAt,
      title: "Case entered matchmaking",
      actor: "ANC Intake Pipeline",
      details: `Requirement parsed: ${c.disciplineNeeded} (${c.hoursPerWeek} hrs/wk)`,
    },
    {
      id: `${c.id}-evt-2`,
      timestamp: evaluatedAt,
      title: "Match Engine completed evaluation",
      actor: "ANC Deterministic Match Engine",
      details: `Evaluated ${
        c.matchResults?.totalCandidatesEvaluated || 10
      } caregiver profiles against mandatory rules.`,
    },
    {
      id: `${c.id}-evt-3`,
      timestamp: evaluatedAt,
      title: "Recommendations generated",
      actor: "ANC Match Engine",
      details: `${
        eligibleCandidates.length || 1
      } eligible candidate(s) ranked. Top score: ${score}%.`,
    },
    {
      id: `${c.id}-evt-4`,
      timestamp: validatedAt,
      title: "Pairing validated by human operator",
      actor:
        normalizedRaw.validationDecision?.validatedBy || "Human Reviewer",
      details: `Approved ${caregiverName} (${caregiverId}). ${
        normalizedRaw.validationDecision?.validationNotes || ""
      }`.trim(),
    },
  ];

  return {
    raw: normalizedRaw,
    id: c.id,
    patientName: c.patientName,
    careRequirement: `${c.disciplineNeeded} • ${c.hoursPerWeek} hrs/wk`,
    disciplineNeeded: c.disciplineNeeded,
    hoursPerWeek: c.hoursPerWeek,
    location: c.zipCode ? `ZIP ${c.zipCode}` : "ZIP 15213",
    zipCode: c.zipCode || "15213",
    smokingRequirement:
      (c as unknown as Record<string, string>).smokingPreference ||
      "Non-Smoker Household Compatible",
    clinicalDirectives:
      c.clinicalDirectives || "Standard clinical care protocol.",
    dateMatched: evaluatedAt,
    lastUpdated: validatedAt,
    status: "Validated",
    recommendedCaregiverName: caregiverName,
    recommendedCaregiverId: caregiverId,
    matchScore: score,
    history,
    isDevSample,
  };
}

export function getPostMatchCases(forceEmpty = false): {
  cases: PostMatchCaseView[];
  isUsingDevFallback: boolean;
} {
  if (forceEmpty) {
    return { cases: [], isUsingDevFallback: false };
  }

  const stored = getStoredCases();
  if (stored.length > 0) {
    const views = stored
      .map((c) => toPostMatchView(c, false))
      .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
    return { cases: views, isUsingDevFallback: false };
  }

  const source = devMemoryOverride ?? DEV_PREVIEW_CASES;
  const previewViews = source
    .map((c) => toPostMatchView(c, true))
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));

  return { cases: previewViews, isUsingDevFallback: true };
}

export function getPostMatchCaseById(caseId: string): PostMatchCaseView | null {
  const { cases } = getPostMatchCases(false);
  return cases.find((c) => c.id.toLowerCase() === caseId.toLowerCase()) || null;
}

export function validateCasePairing(
  caseId: string,
  caregiverId: string,
  caregiverName: string,
  notes: string,
  isAlternative: boolean
): void {
  const stored = getStoredCases();
  const timestamp = new Date()
    .toISOString()
    .replace("T", " ")
    .substring(0, 16);

  if (stored.length > 0) {
    const updated = stored.map((c) => {
      if (c.id.toLowerCase() !== caseId.toLowerCase()) return c;
      return {
        ...c,
        status: "Validated" as const,
        validationDecision: {
          validatedAt: timestamp,
          validatedBy: "Human Reviewer (Validation Dispatch)",
          selectedCaregiverId: caregiverId,
          selectedCaregiverName: caregiverName,
          validationNotes: notes,
          isAlternativeSelection: isAlternative,
        },
      };
    });
    saveStoredCases(updated);
    return;
  }

  const currentDev = devMemoryOverride ?? [...DEV_PREVIEW_CASES];
  devMemoryOverride = currentDev.map((c) => {
    if (c.id.toLowerCase() !== caseId.toLowerCase()) return c;
    return {
      ...c,
      status: "Validated" as const,
      validationDecision: {
        validatedAt: timestamp,
        validatedBy: "Human Reviewer (Validation Dispatch)",
        selectedCaregiverId: caregiverId,
        selectedCaregiverName: caregiverName,
        validationNotes: notes,
        isAlternativeSelection: isAlternative,
      },
    };
  });
}

export function updateCasePostMatchStatus(
  caseId: string,
  newStatus: "Needs Information" | "Unmatched",
  note?: string
): void {
  const stored = getStoredCases();

  if (stored.length > 0) {
    const updated = stored.map((c) => {
      if (c.id.toLowerCase() !== caseId.toLowerCase()) return c;
      return {
        ...c,
        status: newStatus,
        clinicalDirectives: note
          ? `${c.clinicalDirectives || ""} [Operator Flag: ${note}]`.trim()
          : c.clinicalDirectives,
      };
    });
    saveStoredCases(updated);
    return;
  }

  const currentDev = devMemoryOverride ?? [...DEV_PREVIEW_CASES];
  devMemoryOverride = currentDev.map((c) => {
    if (c.id.toLowerCase() !== caseId.toLowerCase()) return c;
    return {
      ...c,
      status: newStatus,
      clinicalDirectives: note
        ? `${c.clinicalDirectives || ""} [Operator Flag: ${note}]`.trim()
        : c.clinicalDirectives,
    };
  });
}