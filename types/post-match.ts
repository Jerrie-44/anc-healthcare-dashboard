// types/post-match.ts

export type PostMatchProcessingStatus =
  | "Awaiting Processing"
  | "Processing In Progress"
  | "Awaiting Documentation"
  | "Awaiting Review"
  | "Requires Clarification"
  | "Processing On Hold"
  | "Ready for Placement"
  | "Processing Failed"
  | "Cancelled";

export type PostMatchCredentialingStatus =
  | "Not Started"
  | "In Progress"
  | "Awaiting Documentation"
  | "Awaiting Review"
  | "Partially Verified"
  | "Verified"
  | "Requires Clarification"
  | "Rejected"
  | "Expired";

export type PostMatchComplianceStatus =
  | "Not Started"
  | "In Progress"
  | "Pending Verification"
  | "Compliant"
  | "Partially Compliant"
  | "Non-Compliant"
  | "Requires Clarification"
  | "Expired"
  | "Not Applicable";

export type ProcessingReadinessStatus =
  | "Not Ready"
  | "Ready for Human Review"
  | "Ready for Placement"
  | "Blocked";

export type RequirementItemStatus =
  | "Not Started"
  | "In Progress"
  | "Awaiting Documentation"
  | "Submitted"
  | "Awaiting Review"
  | "Requires Clarification"
  | "Verified"
  | "Rejected"
  | "Expired"
  | "Not Applicable";

export type DocumentReviewStatus =
  | "Not Submitted"
  | "Submitted"
  | "Awaiting Review"
  | "Under Review"
  | "Verified"
  | "Requires Resubmission"
  | "Rejected"
  | "Expired";

export type RequirementScope = "General" | "Assignment-Specific";

export interface ProcessingRequirementItem {
  id: string;
  processingId: string;
  name: string;
  category:
    | "General Processing"
    | "Assignment-Specific Credentialing"
    | "Assignment-Specific Compliance"
    | "Outstanding Documentation"
    | "Human Review and Verification";
  scope: RequirementScope;
  description: string;
  status: RequirementItemStatus;
  assignedTo: string;
  supportingDocIds: string[];
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  completionDate?: string;
  notApplicableReason?: string;
}

export interface ProcessingDocumentRecord {
  id: string;
  processingId: string;
  caregiverId: string;
  documentName: string;
  category: string;
  fileUrl?: string;
  submissionDate: string;
  uploadedBy: string;
  reviewStatus: DocumentReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  expiryDate?: string;
  rejectionReason?: string;
  version: number;
}

export interface ProcessingExceptionRecord {
  id: string; // e.g. "PME-401"
  processingId: string;
  caseId: string;
  caregiverId: string;
  category:
    | "Missing Credential"
    | "Expired Credential"
    | "Document Clarification Required"
    | "Assignment-Specific Compliance Issue"
    | "Schedule & Commute Mismatch"
    | "Senior Review Escalation";
  description: string;
  status: "Open" | "Assigned" | "In Progress" | "Awaiting Response" | "Escalated" | "Resolved" | "Closed";
  assignedOperator: string;
  detectedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface PostMatchRecord {
  id: string; // e.g. "PMP-701"
  caseId: string;
  patientName: string;
  patientZip: string;
  caregiverId: string;
  caregiverName: string;
  caregiverDiscipline: string;
  caregiverPhone: string;
  matchScore: number;
  matchRank: number;
  matchingRationale: string;
  validatedProfileVersion: number;

  placementId?: string; // Linked official placement reference if confirmed

  // Multi-Axis Statuses
  processingStatus: PostMatchProcessingStatus;
  credentialingStatus: PostMatchCredentialingStatus;
  complianceStatus: PostMatchComplianceStatus;
  readinessStatus: ProcessingReadinessStatus;

  assignedOperator: string;
  dateEntered: string;
  lastUpdated: string;

  requirements: ProcessingRequirementItem[];
  documents: ProcessingDocumentRecord[];
  exceptions: ProcessingExceptionRecord[];
  auditLogs: {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }[];
}

// Configurable workflow trigger model:
// 'MODEL_A' = Post-match processing initiates on Caregiver Shortlist from Matching
// 'MODEL_B' = Post-match processing initiates after explicit Placement selection confirmation
export type PostMatchTriggerModel = "MODEL_A" | "MODEL_B";
export const ACTIVE_TRIGGER_MODEL: PostMatchTriggerModel = "MODEL_A";