// types/caregiver.ts

export type CaregiverLifecycleStage =
  | "Application Received"
  | "AI Screening Completed"
  | "Credential Verification"
  | "Human Approval Required"
  | "Eligible Talent Pool"
  | "Inactive";

// Discrete lifecycle status dimensions
export type ApplicationStatus =
  | "Submitted"
  | "Under Review"
  | "Additional Information Required"
  | "Approved"
  | "Not Approved";

export type ScreeningStatus =
  | "Not Started"
  | "In Progress"
  | "Completed"
  | "Needs Clarification";

export type CredentialingStatus =
  | "Not Started"
  | "In Progress"
  | "Complete"
  | "Issues Identified";

export type ComplianceStatus =
  | "Pending"
  | "Compliant"
  | "Issues Identified"
  | "Expired";

export type HumanApprovalStatus =
  | "Pending Human Review"
  | "Approved"
  | "Not Approved";

export type AvailabilityStatus =
  | "Available"
  | "Partially Available"
  | "Unavailable"
  | "Not Provided";

export type MatchingEligibility =
  | "Eligible"
  | "Ineligible"
  | "Temporarily Ineligible";

export type InformationSource =
  | "intake-submitted"
  | "ai-extracted"
  | "internally-edited"
  | "anc-verified";

export interface TraceableField<T = string | number | boolean | string[]> {
  value: T;
  source: InformationSource;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  previousValue?: T;
  uncertaintyFlag?: boolean;
}

export type DocumentReviewStatus =
  | "Not Submitted"
  | "Submitted"
  | "Under Review"
  | "Verified"
  | "Rejected"
  | "Expired";

export interface CaregiverDocument {
  id: string;
  category:
    | "State Board License"
    | "BLS / CPR Certification"
    | "Government Photo ID"
    | "Background Check Clearance"
    | "TB / Physical Health Screening"
    | "Immunization Records";
  documentName: string;
  fileUrl?: string;
  submissionDate: string;
  reviewStatus: DocumentReviewStatus;
  expiryDate?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  version: number;
}

export interface DayAvailability {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  enabled: boolean;
  morning: boolean;   // 08:00 - 12:00
  afternoon: boolean; // 12:00 - 17:00
  evening: boolean;   // 17:00 - 21:00
  overnight: boolean; // 21:00 - 08:00
}

export interface CaregiverAvailabilitySchedule {
  weeklySlots: DayAvailability[];
  maxHoursPerWeek: number;
  travelRadiusMiles: number;
  preferredZipCodes: string[];
  lastUpdatedAt: string;
  hasActiveConflict?: boolean;
  conflictNotes?: string;
}

export interface CaregiverAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  eventType:
    | "Application Started"
    | "Screening Completed"
    | "Field Edited"
    | "Document Uploaded"
    | "Document Verified"
    | "Document Rejected"
    | "Human Approval Decision"
    | "Availability Updated"
    | "Eligibility Changed";
  details: string;
}

export interface CaregiverRecord {
  id: string; // e.g. "CG-8012"

  // Status Dimensions
  applicationStatus: ApplicationStatus;
  screeningStatus: ScreeningStatus;
  credentialingStatus: CredentialingStatus;
  complianceStatus: ComplianceStatus;
  approvalStatus: HumanApprovalStatus;
  availabilityStatus: AvailabilityStatus;
  matchingEligibility: MatchingEligibility;

  // Personal & Contact Information
  personal: {
    fullName: TraceableField<string>;
    email: TraceableField<string>;
    phone: TraceableField<string>;
    dob: TraceableField<string>;
    addressStreet: TraceableField<string>;
    city: TraceableField<string>;
    state: TraceableField<string>;
    zipCode: TraceableField<string>;
  };

  // Professional Background & Qualifications
  professional: {
    primaryDiscipline: TraceableField<string>; // "RN", "RN-WCC", "PT", "HHA", "CNA"
    yearsExperience: TraceableField<number>;
    specializations: TraceableField<string[]>;
    priorSettings: TraceableField<string[]>; // "Home Health", "Hospice", "ICU", "Acute Care"
  };

  // AI-Assisted Screening Transcript & Entity Capture
  screening: {
    sessionId?: string;
    completedAt?: string;
    transcriptSummary?: string;
    aiExtractedSummary?: string;
    clarificationItems: string[];
    isConfirmedByOperator: boolean;
    reviewedByInternalStaff?: string;
    internalReviewNotes?: string;
  };

  // Credentials & Compliance
  documents: CaregiverDocument[];

  // Availability & Scheduling
  availability: CaregiverAvailabilitySchedule;

  // Placements / Active Caseload
  placements: {
    activeCasesCount: number;
    maxCaseloadCapacity: number;
    assignedCaseIds: string[];
  };

  // Human Review & Audit
  humanApproval: {
    decision?: HumanApprovalStatus;
    decidedBy?: string;
    decidedAt?: string;
    decisionNotes?: string;
  };

  auditHistory: CaregiverAuditLog[];
}

/**
 * Derived Matching Eligibility Engine Rule:
 * Caregiver is ONLY eligible for deterministic case matching if:
 * 1. Human Approval Status is "Approved"
 * 2. Compliance Status is "Compliant" (all required docs verified & unexpired)
 * 3. Availability is provided and enabled
 * 4. Caseload has not hit max capacity
 */
export function computeMatchingEligibility(cg: CaregiverRecord): MatchingEligibility {
  if (cg.approvalStatus !== "Approved") return "Ineligible";
  if (cg.complianceStatus === "Expired" || cg.complianceStatus === "Issues Identified") {
    return "Temporarily Ineligible";
  }
  if (cg.availabilityStatus === "Unavailable" || cg.availabilityStatus === "Not Provided") {
    return "Temporarily Ineligible";
  }
  if (cg.placements.activeCasesCount >= cg.placements.maxCaseloadCapacity) {
    return "Temporarily Ineligible";
  }
  return "Eligible";
}