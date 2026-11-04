// types/screening.ts

export type ScreeningInvitationStatus =
  | "Draft"
  | "Pending"
  | "Sent"
  | "Delivered"
  | "Opened"
  | "In Progress"
  | "Completed"
  | "Expired"
  | "Failed";

export type ScreeningOutcome =
  | "Pending Evaluation"
  | "Recommended for Review"
  | "Incomplete Transcript"
  | "Escalated for Verification";

export type ReviewDecision =
  | "Approved for Matching"
  | "Further Review Required"
  | "Additional Information Required"
  | "Not Progressing";

export interface InterviewQA {
  id: string;
  questionIndex: number;
  questionText: string;
  competencyArea: string;
  transcript: string;
  candidateResponseAudioUrl?: string;
  durationSeconds: number;
  unanswered?: boolean;
}

export interface StructuredScreeningAssessment {
  summary: string;
  careExperienceYears: number;
  identifiedDisciplines: string[];
  extractedCertifications: {
    name: string;
    status: "Verified by Candidate" | "Requires Documentation Upload";
  }[];
  clinicalCompetencies: string[];
  weeklyAvailability: string;
  shiftPreferences: string[];
  communicationObservations: string;
  requiresHumanClarification: string[];
}

export interface CandidateScreeningSession {
  sessionId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  role: string;
  invitationStatus: ScreeningInvitationStatus;
  dateInvited: string;
  dateStarted?: string;
  dateCompleted?: string;
  durationSeconds?: number;
  outcome: ScreeningOutcome;
  secureToken: string;
  questions: InterviewQA[];
  assessment?: StructuredScreeningAssessment;
  reviewDecision?: ReviewDecision;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export const STANDARDIZED_SCREENING_QUESTIONS: { text: string; competencyArea: string }[] = [
  {
    text: "Welcome to ANC Healthcare's initial clinical screening. To begin, please state your full name and your current primary nursing or caregiving credential.",
    competencyArea: "Candidate Identity & Primary Credential",
  },
  {
    text: "How many years of direct hands-on patient care experience do you have, and in what healthcare settings have you worked?",
    competencyArea: "Professional Care History",
  },
  {
    text: "Can you describe your experience managing complex patient needs such as post-operative wound care, mobility transfers, or dementia support?",
    competencyArea: "Clinical Competencies & Technical Skills",
  },
  {
    text: "What active board licenses, BLS/CPR certifications, or state registrations do you currently hold?",
    competencyArea: "Regulatory & License Verifications",
  },
  {
    text: "What are your preferred working hours, shift lengths, and weekly availability for home visits?",
    competencyArea: "Schedule Availability & Territory",
  },
];