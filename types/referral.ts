// types/referral.ts

export type IntakeStatus = "Received";
export type DuplicateReviewStatus = "Not Reviewed" | "Clear" | "Potential Duplicate" | "Confirmed Duplicate";
export type ExtractionStatus = "Processing" | "Completed" | "Failed" | "Extracted";
export type ValidationStatus = "Awaiting Validation" | "Needs Correction" | "On Hold" | "Validated";
export type MatchingStatus = "Not Started" | "Queued" | "In Progress" | "Recommendations Ready" | "Failed";
export type HumanReviewStatus = "Awaiting Review" | "Reviewed" | "Approved";

export type SchedulingStatus =
  | "Not Provided"
  | "Incomplete"
  | "Awaiting Confirmation"
  | "Confirmed"
  | "Conflicting";

export type DerivedCaseStatus =
  | "Processing"
  | "Extracting Information"
  | "Extraction Failed"
  | "Awaiting Validation"
  | "Duplicate Flagged"
  | "Duplicate Review Required"
  | "Needs Correction"
  | "On Hold"
  | "Validation On Hold"
  | "Validated"
  | "Matching in Progress"
  | "Matching In Progress"
  | "Matching Failed"
  | "Recommendations Ready"
  | "Placement In Progress"
  | "Approved"
  | "Received";

export type FieldVerificationState =
  | "ai-extracted"
  | "human-edited"
  | "human-confirmed"
  | "missing"
  | "uncertain"
  | "AI Extracted"
  | "Human Edited"
  | "Human Confirmed"
  | "Missing Information"
  | "Uncertain Extraction";

export type ScheduleCompatibilityOutcome =
  | "Full Schedule Match"
  | "Partial Match"
  | "Schedule Incompatible"
  | "Unverified / Stale Availability";

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type TimeWindow =
  | "Morning (08:00 - 12:00)"
  | "Afternoon (12:00 - 17:00)"
  | "Evening (17:00 - 21:00)"
  | "Flexible";

export interface CaseField<T = string | number | string[]> {
  value: T;
  state: FieldVerificationState;
  originalExtractedValue?: T;
  extractedConfidence?: number;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export type FieldState<T> = CaseField<T>;

export interface CareScheduleRequirements {
  startDate: CaseField<string>;
  requiredDays: CaseField<DayOfWeek[]>;
  timeWindows: CaseField<TimeWindow[]>;
  hoursPerWeek: CaseField<number>;
  recurringType: CaseField<"Recurring Weekly" | "One-Time Care" | "Temporary / Short-Term">;
  careTimeZone: CaseField<string>;
  schedulingConstraints: CaseField<string>;
  sourceDocumentRef: string;
}

export interface CaseProfileDraft {
  patientName: CaseField<string>;
  dob?: CaseField<string>;
  dateOfBirth?: CaseField<string>;
  age?: CaseField<number>;
  zipCode: CaseField<string>;
  primaryCondition?: CaseField<string>;
  careDisciplineRequired: CaseField<string>;
  authorizedHoursPerWeek: CaseField<number>;
  shiftPreference?: CaseField<string>;
  clinicalNotesSummary: CaseField<string>;
  missingRequiredFields: string[];
  schedule: CareScheduleRequirements;
}

export interface SourceDocument {
  id: string;
  name?: string;
  fileName?: string;
  type?: "pdf" | "fax" | "email" | "spreadsheet" | string;
  fileType?: "Fax Transmission" | "Email Intake" | "Spreadsheet / Care Connector" | "Hospital Discharge PDF" | string;
  rawContent?: string;
  rawTextPreview?: string;
  fileUrl?: string;
  fileSize?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export type ReferralSourceDocument = SourceDocument;

export interface ScheduleCompatibilityInfo {
  outcome: ScheduleCompatibilityOutcome;
  details: string;
  overlappingDays: DayOfWeek[];
  conflictingDays: DayOfWeek[];
}

export interface CaregiverRecommendation {
  caregiverId: string;
  caregiverName: string;
  discipline: string;
  matchScore: number;
  distanceMiles: number;
  activeCaseload: number;
  maxCaseload: number;
  credentials: string[];
  availabilityMatches?: boolean;
  matchingRationale: string;
  isFlaggedForReview?: boolean;
  scheduleCompatibility: ScheduleCompatibilityInfo;
}

export type CaregiverMatchingRecommendation = CaregiverRecommendation;
export type MatchingEngineStatus = MatchingStatus;

export interface CaseActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
}

export interface CaseRecord {
  id: string;
  referralSource: string;
  dateReceived: string;
  intakeMethod?: "document" | "email" | "spreadsheet";
  internalNotes?: string;
  receivedNotes?: string;
  uploadedBy?: string;
  uploaderName?: string;

  intakeStatus?: IntakeStatus;
  duplicateStatus: DuplicateReviewStatus;
  extractionStatus: ExtractionStatus;
  validationStatus: ValidationStatus;
  matchingStatus: MatchingStatus;
  humanReviewStatus: HumanReviewStatus;
  schedulingStatus?: SchedulingStatus;

  potentialDuplicateOfCaseId?: string;
  duplicateCandidateRefs?: string[];
  sourceDocuments: SourceDocument[];
  draftProfile: CaseProfileDraft;
  validatedProfileVersion?: number;
  validatedProfileHistory: {
    version: number;
    profile: CaseProfileDraft;
    validatedBy: string;
    validatedAt: string;
  }[];
  validatedBy?: string;
  validatedAt?: string;
  recommendations: CaregiverRecommendation[];
  activityLogs: CaseActivityLog[];
}

export function computeDerivedStatus(c: CaseRecord): DerivedCaseStatus {
  if (c.duplicateStatus === "Potential Duplicate") return "Duplicate Flagged";
  if (c.extractionStatus === "Processing") return "Processing";
  if (c.extractionStatus === "Failed") return "Extraction Failed";
  if (c.validationStatus === "On Hold") return "On Hold";
  if (c.validationStatus === "Needs Correction") return "Needs Correction";
  if (c.validationStatus === "Awaiting Validation") return "Awaiting Validation";
  if (c.validationStatus === "Validated") {
    if (c.humanReviewStatus === "Approved") return "Approved";
    if (c.matchingStatus === "In Progress" || c.matchingStatus === "Queued") return "Matching in Progress";
    if (c.matchingStatus === "Recommendations Ready") return "Recommendations Ready";
    if (c.matchingStatus === "Failed") return "Matching Failed";
    return "Validated";
  }
  return "Received";
}

// Bulk Upload & Batch Ingestion Types

export type BulkImportMethod = "spreadsheet" | "documents" | "Spreadsheet" | "Multi-PDF" | "Care Connector";

export type BulkBatchStatus =
  | "Uploading"
  | "Validating"
  | "Awaiting Confirmation"
  | "Importing"
  | "Processing"
  | "Completed"
  | "Completed with Errors"
  | "Failed"
  | "Parsing"
  | "Mapping"
  | "Ready for Review"
  | "Committed";

export type BulkRecordStatus =
  | "Pending Import"
  | "Imported"
  | "Invalid"
  | "Potential Duplicate"
  | "Processing"
  | "Extraction Failed"
  | "Awaiting Validation"
  | "Validated"
  | "Matching In Progress"
  | "Recommendations Ready"
  | "Valid"
  | "Excluded";

export interface ColumnMappingConfig {
  patientName?: string;
  dob?: string;
  zipCode?: string;
  careDiscipline?: string;
  authorizedHours?: string;
  clinicalNotes?: string;
  sourceColumn?: string;
  targetField?: string;
  confidence?: number;
}

export interface ParsedStagedFields {
  patientName: string;
  dob: string;
  zipCode: string;
  careDiscipline: string;
  authorizedHours: number;
  clinicalNotes: string;
}

export interface StagedReferralRecord {
  id?: string;
  tempId?: string;
  batchId?: string;
  rowNumber?: number;
  sourceFile?: string;
  rawData?: Record<string, any>;
  rawRowData?: Record<string, any>;
  parsedFields: ParsedStagedFields;
  mappedPatientName?: string;
  mappedDob?: string;
  mappedZip?: string;
  mappedDiscipline?: string;
  mappedHours?: number;
  isValid: boolean;
  validationErrors: string[];
  isPotentialDuplicate: boolean;
  duplicateMatchId?: string;
  isExcluded: boolean;
  createdReferralId?: string;
  recordStatus: BulkRecordStatus;
  status?: "Valid" | "Invalid" | "Excluded" | "Imported" | BulkRecordStatus;
}

export interface BulkImportBatch {
  id?: string;
  batchId: string;
  fileName?: string;
  importMethod: BulkImportMethod;
  referralSource: string;
  uploadedBy: string;
  uploadedAt: string;
  sourceFiles?: string[];
  totalRecordsDetected?: number;
  totalRows?: number;
  validRowsCount?: number;
  errorRowsCount?: number;
  successfullyImported?: number;
  failedRecords?: number;
  flaggedDuplicates?: number;
  status: BulkBatchStatus;
  records: StagedReferralRecord[];
}

// Backward Compatibility Aliases & Exports

export type Referral = CaseRecord;

export type TriageStage =
  | "Unassigned"
  | "Triage"
  | "Assigned"
  | "In Progress"
  | "Completed";

export type PriorityLevel = "Low" | "Medium" | "High" | "Urgent";

export { MOCK_CASES_DB as MOCK_REFERRALS } from "@/lib/referral-service";