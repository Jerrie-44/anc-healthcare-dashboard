// types/overview.ts

export type OperationalModule = "Cases & Referrals" | "Care Givers" | "Placements";

export type TaskOwnershipCategory =
  | "Assigned to Me"
  | "Unassigned"
  | "Assigned to Others"
  | "Escalated / Senior Review";

export type TaskPriority = "Critical" | "High" | "Standard";

export interface OverviewTaskItem {
  id: string;
  title: string;
  description: string;
  module: OperationalModule;
  recordId: string;
  recordHref: string;
  status: string;
  priority: TaskPriority;
  ownership: TaskOwnershipCategory;
  assignedOperatorName?: string;
  assignedOperatorId?: string;
  createdAt: string;
  waitingDurationText: string;
  primaryActionLabel: string;
  actionHref: string;
}

export interface OperationalMetricsSummary {
  totalReferrals: number;
  referralsAwaitingValidation: number;
  eligibleCaregivers: number;
  applicationsAwaitingReview: number;
  pendingPlacements: number;
  activePlacements: number;
}

export interface PipelineStageSummary {
  stageKey: string;
  label: string;
  count: number;
  description?: string;
  href: string;
}

export interface AggregatedActivityItem {
  id: string;
  timestamp: string;
  module: OperationalModule;
  actor: string;
  action: string;
  details: string;
  recordId: string;
  recordHref: string;
}

export interface OperationalExceptionItem {
  id: string;
  category: string;
  module: OperationalModule;
  recordId: string;
  recordHref: string;
  description: string;
  status: "Open" | "In Review" | "Resolved";
  detectedAt: string;
  assignedOperator: string;
  nextActionLabel: string;
  actionHref: string;
}

export interface OverviewDashboardData {
  metrics: OperationalMetricsSummary;
  tasks: {
    assignedToMe: OverviewTaskItem[];
    unassigned: OverviewTaskItem[];
    assignedToOthers: OverviewTaskItem[];
    seniorReview: OverviewTaskItem[];
    totalOutstanding: number;
  };
  referralPipeline: PipelineStageSummary[];
  caregiverPipeline: PipelineStageSummary[];
  placementPipeline: PipelineStageSummary[];
  recentActivity: AggregatedActivityItem[];
  exceptions: OperationalExceptionItem[];
  lastUpdatedTimestamp: string;
}