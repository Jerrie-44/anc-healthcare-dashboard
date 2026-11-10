// types/anc-core.ts

export type HardRuleKey = 
  | "smoking_restriction" 
  | "mandatory_certifications" 
  | "schedule_availability" 
  | "geographic_radius";

export interface HardRuleEvaluation {
  rule: HardRuleKey;
  label: string;
  passed: boolean;
  requirementValue: string | string[];
  caregiverValue: string | string[];
  failureReason?: string;
}

export interface CommuteAnalysis {
  distanceMiles: number;
  estimatedDriveMinutes: number;
  transitAvailable: boolean;
  proximityScore: number; // 0 - 100
  originZip: string;
  destinationZip: string;
}

// ----------------------------------------------------
// STREAM 1: CARE REQUIREMENTS (Government Demand)
// ----------------------------------------------------
export type RequirementLifecycle = 
  | "intake_processing"
  | "awaiting_match_run"
  | "ai_matched"          // Algorithmic shortlist ready
  | "human_validated"     // Operator confirmed caregiver selection
  | "unmatched"           // Hard rules failed across candidate pool
  | "escalation_required"; // Missing mandatory intake info

export interface CareRequirement {
  id: string; // e.g., "REQ-7104"
  sourceDocumentRef: string;
  intakeTimestamp: string;
  contractSource: "Keystone Care Connector" | "UPMC Health Plan" | "VA Community Care";
  
  // Mandatory Hard-Rule Criteria
  requiredDiscipline: "Registered Nurse (RN)" | "Physical Therapist (PT)" | "Home Health Aide (HHA)" | "Wound Care Specialist";
  nonSmokingHouseholdRequired: boolean;
  zipCode: string;
  scheduleHoursPerWeek: number;
  timeWindows: ("Morning" | "Afternoon" | "Evening")[];
  
  // Contextual Clinical Summary
  clinicalDirectivesSummary: string;
  status: RequirementLifecycle;
  
  // Target Selection (Populated upon human validation)
  validatedCaregiverId?: string;
  validationNotes?: string;
  validatedAt?: string;
  validatedBy?: string;
}

// ----------------------------------------------------
// STREAM 2: TALENT DATABASE (Enriched Supply)
// ----------------------------------------------------
export interface CaregiverTalent {
  id: string; // e.g., "CG-204"
  name: string;
  discipline: "Registered Nurse (RN)" | "Physical Therapist (PT)" | "Home Health Aide (HHA)" | "Wound Care Specialist";
  zipCode: string;
  isSmoker: boolean;
  activeCertifications: string[];
  yearsExperience: number;
  
  // Voice Screening AI Output (Profile Enrichment)
  voiceScreening: {
    status: "Completed" | "Pending" | "Unverified";
    communicationScore: number; // 1 - 5
    clinicalAptitudeScore: number; // 1 - 5
    summaryTranscript: string;
    screeningDate?: string;
  };

  // Schedule & Capacity
  availableTimeWindows: ("Morning" | "Afternoon" | "Evening")[];
  maxWeeklyHours: number;
  currentAllocatedHours: number;
}

// ----------------------------------------------------
// MATCH ENGINE EVALUATION & EXPLANATION
// ----------------------------------------------------
export interface MatchCandidate {
  caregiverId: string;
  caregiver: CaregiverTalent;
  overallScore: number; // 0 - 100
  rank: number;
  
  // Explainability Breakdown
  hardRules: HardRuleEvaluation[];
  commute: CommuteAnalysis;
  clinicalMatchScore: number;
  experienceMatchScore: number;
  explanationBullets: string[];
  
  // Gate: False if any hard rule fails
  isEligibleForValidation: boolean;
}

export interface MatchEngineResult {
  requirementId: string;
  runTimestamp: string;
  totalCandidatesEvaluated: number;
  eligibleCount: number;
  ineligibleCount: number;
  shortlist: MatchCandidate[];
}