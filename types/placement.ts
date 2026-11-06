// types/placement.ts

export type PlacementLifecycleStatus =
  | "Created"
  | "Preparing"
  | "Active"
  | "On Hold"
  | "Completed"
  | "Cancelled";

export type CaregiverResponseStatus =
  | "Not Contacted"
  | "Contact Pending"
  | "Accepted"
  | "Declined"
  | "Unreachable";

export type CoordinationStatus =
  | "Not Started"
  | "In Progress"
  | "Awaiting Information"
  | "Completed";

export type ServiceProgressStatus =
  | "Not Started"
  | "In Progress"
  | "Interrupted"
  | "Completed";

export type ContactMethod = "Phone Call" | "SMS Dispatch" | "Portal Notification" | "Email";
export type ContactOutcome = "Spoke with Caregiver" | "Left Voicemail" | "No Answer" | "Declined on Call";
export type CaregiverResponseType = "Accepted" | "Declined" | "Pending";

export interface PlacementContactRecord {
  id: string;
  placementId: string;
  method: ContactMethod;
  timestamp: string;
  contactedBy: string;
  outcome: ContactOutcome;
  notes: string;
  nextFollowUpAt?: string;
}

export interface PlacementResponseRecord {
  id: string;
  placementId: string;
  responseType: CaregiverResponseType;
  timestamp: string;
  responseChannel: string;
  declineReason?: string;
  recordedBy: string;
}

export interface CoordinationTask {
  id: string;
  placementId: string;
  title: string;
  description: string;
  isCompleted: boolean;
  assignedTo: string;
  dueDate: string;
  completedAt?: string;
}

export interface PlacementIssueRecord {
  id: string;
  placementId: string;
  category:
    | "Caregiver Availability Conflict"
    | "Transportation Disruption"
    | "Clinical Directive Mismatch"
    | "Patient Schedule Change"
    | "Credential Verification Alert";
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: "Open" | "In Review" | "Resolved";
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface PlacementRecord {
  id: string; // e.g. "PLC-601"
  caseId: string;
  patientName: string;
  patientZip: string;
  careDisciplineRequired: string;
  authorizedHoursPerWeek: number;
  referralProfileVersion: number;

  caregiverId: string;
  caregiverName: string;
  caregiverDiscipline: string;
  caregiverPhone: string;
  caregiverMatchRank: number;

  // Discrete 4-Axis Status Architecture
  lifecycleStatus: PlacementLifecycleStatus;
  caregiverResponseStatus: CaregiverResponseStatus;
  coordinationStatus: CoordinationStatus;
  serviceStatus: ServiceProgressStatus;

  // Replacement Linkage
  previousPlacementId?: string;
  replacementPlacementId?: string;

  // Audit and Timestamps
  createdBy: string;
  createdAt: string;
  acceptedAt?: string;
  activatedBy?: string;
  activatedAt?: string;
  completedBy?: string;
  completedAt?: string;
  completionReason?: string;

  // Relational Sub-records
  contacts: PlacementContactRecord[];
  responses: PlacementResponseRecord[];
  tasks: CoordinationTask[];
  issues: PlacementIssueRecord[];
  activityLogs: {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }[];
}