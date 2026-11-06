// types/interview-session.ts
import { InformationSource } from "@/types/caregiver";

export type InterviewSessionType =
  | "Initial Screening"
  | "Follow-up Clarification"
  | "Clinical Competency Reassessment";

export type SessionLifecycleStatus =
  | "Interview Required"
  | "Interview Initiated"
  | "In Progress"
  | "Completed"
  | "Interrupted"
  | "Failed"
  | "Requires Follow-up"
  | "Cancelled";

export type AIProcessingStatus =
  | "Not Started"
  | "Processing"
  | "Completed"
  | "Failed";

export type HumanReviewStatus =
  | "Awaiting Human Review"
  | "In Review"
  | "Requires Follow-up"
  | "Reviewed";

export type ExtractedFieldReviewState =
  | "AI Extracted"
  | "Uncertain"
  | "Missing"
  | "Caregiver Corrected"
  | "Human Confirmed"
  | "Human Edited";

export interface ExtractedInterviewItem<T = string | string[] | number> {
  value: T;
  reviewState: ExtractedFieldReviewState;
  source: InformationSource;
  confidenceScore?: number;
  originalTranscriptExcerpt?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export interface ConversationTurn {
  id: string;
  speaker: "ai-assistant" | "caregiver";
  timestamp: string;
  messageText: string;
  isClarificationPrompt?: boolean;
  audioDurationSeconds?: number;
}

export interface StructuredInterviewProfile {
  professionalBackground: {
    experienceSummary: ExtractedInterviewItem<string>;
    yearsExperience: ExtractedInterviewItem<number>;
    priorSettings: ExtractedInterviewItem<string[]>;
  };
  clinicalBackground: {
    primaryDiscipline: ExtractedInterviewItem<string>;
    familiarConditions: ExtractedInterviewItem<string[]>;
    specializedProcedures: ExtractedInterviewItem<string[]>;
  };
  preferences: {
    workArrangement: ExtractedInterviewItem<string>;
    shiftPreferences: ExtractedInterviewItem<string>;
  };
  logistics: {
    travelRadiusMiles: ExtractedInterviewItem<number>;
    territoryZipCodes: ExtractedInterviewItem<string[]>;
    transportationReliability: ExtractedInterviewItem<string>;
  };
  availability: {
    weeklyHoursCapacity: ExtractedInterviewItem<number>;
    daysAvailableSummary: ExtractedInterviewItem<string>;
  };
  insights: {
    unclearItems: string[];
    missingItems: string[];
    inconsistenciesWithProfile: string[];
    notesForReviewer?: string;
  };
}

export interface InterviewSessionRecord {
  sessionId: string; // e.g., "IV-9012"
  caregiverId: string;
  caregiverName: string;
  interviewType: InterviewSessionType;
  questionSetVersion: string; // e.g., "ANC-CLINICAL-V3"

  // Separated 3-Axis Lifecycle Status
  sessionStatus: SessionLifecycleStatus;
  processingStatus: AIProcessingStatus;
  reviewStatus: HumanReviewStatus;

  // Timestamps & Metrics
  date: string;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;

  // Conversation & Transcription
  transcript: ConversationTurn[];
  hasAudioRecording: boolean;
  audioRecordingUrl?: string;

  // Structured Outputs
  structuredData: StructuredInterviewProfile;

  // Operator Verification & Follow-up
  reviewedBy?: string;
  reviewedAt?: string;
  internalReviewNotes?: string;
  followUpReason?: string;
  followUpCreatedSessionId?: string;

  // Audit Logs
  history: {
    timestamp: string;
    actor: string;
    action: string;
    notes?: string;
  }[];
}