// types/caregiver.ts

export type CaregiverLifecycleStage =
  | "Application Received"
  | "AI Screening Completed"
  | "Credential Verification"
  | "Human Approval Required"
  | "Eligible Talent Pool"
  | "Inactive";

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
  | "Needs Clarification"
  | "Needs Review"
  | "Pending"
  | "Failed";

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
  | "Limited Availability"
  | "Partially Available"
  | "Unavailable"
  | "Not Provided";

export type CaregiverAvailabilityStatus = AvailabilityStatus;
export type CaregiverScreeningStatus = ScreeningStatus;

export type MatchingEligibility =
  | "Eligible"
  | "Requires Review"
  | "Not Eligible";

export type CaregiverRecordStatus =
  | "Active"
  | "On Assignment"
  | "Under Review"
  | "Inactive";

export type CaregiverQualification =
  | "Registered Nurse (RN)"
  | "Home Health Aide (HHA)"
  | "Physical Therapist (PT)"
  | "Occupational Therapist (OT)"
  | "Certified Nursing Assistant (CNA)";

export type CertificationStatus =
  | "Valid"
  | "Expired"
  | "Pending Verification"
  | "Missing";

export interface CaregiverCertificationRecord {
  id: string;
  name: string;
  issuingOrg: string;
  issueDate: string;
  expiryDate: string;
  status: CertificationStatus;
  verificationSource?: string;
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

export interface CaregiverAssignmentRecord {
  caseId: string;
  patientName: string;
  careRequirement: string;
  assignmentDate: string;
  period?: string;
  status: "Active" | "Completed" | "Pending Handover";
  validationType: "AI Recommended" | "Human Validated";
  matchScore?: number;
  outcomeNotes?: string;
}

export interface CaregiverVoiceScreeningDetails {
  sessionId?: string;
  completedAt?: string;
  lastUpdatedDate?: string;
  operatorReviewStatus: "Pending Operator Review" | "Reviewed & Approved" | "Clarification Flagged";
  operatorReviewNotes?: string;
  operatorReviewedAt?: string;
  operatorReviewerName?: string;
  overallScore?: number;
  strengths: string[];
  potentialConcerns: string[];
  reviewItems: string[];
  transcriptExcerpt?: string;
  caregiverPreferences: {
    preferredHours: string;
    preferredShifts: string[];
    maxCommuteMiles: number;
    preferredLocations: string[];
    householdAllergiesNotice?: string;
  };
}

export interface CaregiverDirectoryRecord {
  id: string;
  name: string;
  avatarUrl?: string;
  qualification: CaregiverQualification | string;
  zipCode: string;
  serviceArea: string;
  availability: AvailabilityStatus;
  screening: ScreeningStatus;
  status: CaregiverRecordStatus;
  matchingEligibility?: MatchingEligibility;
  voiceScreeningScore?: number;
  activeCertifications: string[];
  detailedCertifications?: CaregiverCertificationRecord[];
  documents?: CaregiverDocument[];
  screeningDetails?: CaregiverVoiceScreeningDetails;
  assignments?: CaregiverAssignmentRecord[];
  yearsExperience: number;
  commuteMinutes?: number;
  isSmoker: boolean;
  phone?: string;
  email?: string;
  residentialAddress?: string;
  city?: string;
  state?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  clinicalSkills?: string[];
  languages?: string[];
  weeklyCapacityHours?: number;
  preferredDays?: string[];
  schedulingRestrictions?: string;
  joinedDate: string;
}

export interface CaregiverDirectoryMetrics {
  total: number;
  available: number;
  onAssignment: number;
  underReview: number;
}