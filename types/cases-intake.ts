// types/cases-intake.ts

export type WorkflowStage = "01_review_referral" | "02_match_caregivers" | "03_validate_matches";

export type PatientRequirementStatus = "Complete" | "Needs Information" | "Requires Review";

export type PatientSelectionStatus = "Match Selected" | "Awaiting Selection" | "Unmatched" | "Needs Information";

export type MatchingOutcomeStatus = "Recommended" | "Validated" | "Unmatched" | "Needs Information";

export type CaseWorkflowStatus =
  | "Processing"
  | "Needs Information"
  | "Matching"
  | "Pending Review"
  | "Validated"
  | "Unmatched";

export type BatchWorkflowStatus =
  | "Uploaded"
  | "Parsing"
  | "Needs Attention"
  | "Matching"
  | "Awaiting Validation"
  | "Partially Validated"
  | "Completed";

export interface HardRuleCheck {
  id: string;
  label: string;
  passed: boolean;
  requirementValue: string;
  candidateValue: string;
  failureReason?: string;
}

export type TrafficBand = "Light" | "Moderate" | "Heavy";

export interface CandidateCommuteInfo {
  distanceMiles: number;
  driveTimeMinutes: number;
  originZip: string;
  destinationZip: string;
  trafficBand: TrafficBand;
}

export interface RankedCaregiverMatch {
  caregiverId: string;
  name: string;
  discipline: string;
  overallScore: number;
  rank: number;
  hardRules: HardRuleCheck[];
  allHardRulesPassed: boolean;
  commute: CandidateCommuteInfo;
  certifications: string[];
  voiceScreeningScore: number;
  voiceSummary: string;
  matchRationale: string[];
  isFlaggedForVerification?: boolean;
  flagReason?: string;
  isRejected?: boolean;
  rejectionReason?: string;
}

export interface ExtractedPatientCase {
  id: string;
  patientName: string;
  dob: string;
  zipCode: string;
  disciplineNeeded: string;
  hoursPerWeek: number;
  nonSmokingHousehold: boolean;
  clinicalDirectives: string;
  requirementStatus: PatientRequirementStatus;
  missingFields: string[];
  
  matchingStatus: MatchingOutcomeStatus;
  selectionStatus?: PatientSelectionStatus;
  availableCandidates?: RankedCaregiverMatch[];
  selectedCaregiverId?: string | null;
  selectedCaregiver?: RankedCaregiverMatch;
  alternativeMatches?: RankedCaregiverMatch[];
  unmatchedReason?: string;
  
  validatedAt?: string;
  validatedBy?: string;
  validationNotes?: string;
}

export interface CaseIntakeRecord {
  id: string;
  batchId?: string;
  sourceFile?: string;
  dateIngested?: string;
  referralSource?: string;
  patientName: string;
  dob?: string;
  zipCode: string;
  disciplineNeeded: string;
  hoursPerWeek: number;
  nonSmokingHousehold: boolean;
  clinicalDirectives: string;
  status: CaseWorkflowStatus;
  missingFields: string[];
  matchResults?: {
    evaluatedAt: string;
    totalCandidatesEvaluated: number;
    shortlist: RankedCaregiverMatch[];
    unmatchedReason?: string;
  };
  validationDecision?: {
    validatedAt: string;
    validatedBy: string;
    selectedCaregiverId: string;
    selectedCaregiverName: string;
    validationNotes: string;
    isAlternativeSelection: boolean;
  };
}

export interface ReferralBatchRecord {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  referralSource: string;
  totalRequirements: number;
  status: BatchWorkflowStatus;
  cases: CaseIntakeRecord[];
}