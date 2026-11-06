// lib/overview-service.ts
import { MOCK_CASES_DB } from "@/lib/referral-service";
import { MOCK_CAREGIVERS_DB } from "@/lib/caregiver-service";
import { MOCK_INTERVIEW_SESSIONS } from "@/lib/interview-service";
import { MOCK_PLACEMENTS_DB } from "@/lib/placement-service";
import { MOCK_POST_MATCH_DB } from "@/lib/post-match-service";
import { computeMatchingEligibility } from "@/types/caregiver";
import {
  OverviewDashboardData,
  OverviewTaskItem,
  AggregatedActivityItem,
  OperationalExceptionItem,
  PipelineStageSummary,
} from "@/types/overview";

const CURRENT_USER = {
  name: "Dr. R. Sterling",
  role: "Lead Clinical Dispatcher",
  isSeniorReviewer: true,
};

export function getOverviewDashboardData(): OverviewDashboardData {
  const now = new Date();

  // 1. Metric Counts
  const totalReferrals = MOCK_CASES_DB.length;
  const referralsAwaitingValidation = MOCK_CASES_DB.filter(
    (c) => c.validationStatus === "Awaiting Validation"
  ).length;

  const eligibleCaregivers = MOCK_CAREGIVERS_DB.filter(
    (c) => computeMatchingEligibility(c) === "Eligible"
  ).length;

  const applicationsAwaitingReview =
    MOCK_CAREGIVERS_DB.filter((c) => c.approvalStatus === "Pending Human Review").length +
    MOCK_INTERVIEW_SESSIONS.filter((s) => s.reviewStatus === "Awaiting Human Review").length;

  const pendingPlacements = MOCK_PLACEMENTS_DB.filter(
    (p) => p.lifecycleStatus === "Created" || p.lifecycleStatus === "Preparing"
  ).length;

  const activePlacements = MOCK_PLACEMENTS_DB.filter(
    (p) => p.lifecycleStatus === "Active"
  ).length;

  // 2. Cross-Module Tasks
  const allTasks: OverviewTaskItem[] = [];

  // Cases & Referrals
  MOCK_CASES_DB.forEach((c) => {
    if (c.duplicateStatus === "Potential Duplicate") {
      allTasks.push({
        id: `tsk-dup-${c.id}`,
        title: "Potential Duplicate Referral Detected",
        description: `Incoming case matches an existing patient profile (${c.draftProfile.patientName.value}). Duplicate review required before clinical assignment.`,
        module: "Cases & Referrals",
        recordId: c.id,
        recordHref: `/referrals/${c.id}`,
        status: "Duplicate Flagged",
        priority: "High",
        ownership: "Assigned to Me",
        assignedOperatorName: CURRENT_USER.name,
        createdAt: c.dateReceived,
        waitingDurationText: "1 day waiting",
        primaryActionLabel: "Review Duplicate",
        actionHref: `/referrals/${c.id}/validate`,
      });
    } else if (c.validationStatus === "Awaiting Validation") {
      allTasks.push({
        id: `tsk-val-${c.id}`,
        title: "Referral Awaiting Clinical Validation",
        description: `Patient ${c.draftProfile.patientName.value} requires extraction verification and required-field clearance.`,
        module: "Cases & Referrals",
        recordId: c.id,
        recordHref: `/referrals/${c.id}`,
        status: "Awaiting Validation",
        priority: "High",
        ownership: "Assigned to Me",
        assignedOperatorName: CURRENT_USER.name,
        createdAt: c.dateReceived,
        waitingDurationText: "4 hours waiting",
        primaryActionLabel: "Open Validation Desk",
        actionHref: `/referrals/${c.id}/validate`,
      });
    } else if (c.matchingStatus === "Recommendations Ready" && c.humanReviewStatus !== "Approved") {
      allTasks.push({
        id: `tsk-mat-${c.id}`,
        title: "Deterministic Recommendations Ready for Selection",
        description: `${c.recommendations.length} recommended caregivers generated for ${c.draftProfile.patientName.value}. Operator selection required.`,
        module: "Cases & Referrals",
        recordId: c.id,
        recordHref: `/referrals/${c.id}`,
        status: "Recommendations Ready",
        priority: "Standard",
        ownership: "Unassigned",
        createdAt: c.dateReceived,
        waitingDurationText: "6 hours waiting",
        primaryActionLabel: "Review Matches & Select",
        actionHref: `/referrals/${c.id}`,
      });
    }
  });

  // Care Givers & AI Interview
  MOCK_INTERVIEW_SESSIONS.forEach((s) => {
    if (s.reviewStatus === "Awaiting Human Review") {
      allTasks.push({
        id: `tsk-iv-${s.sessionId}`,
        title: "AI Voice Interview Awaiting Human Review",
        description: `Transcript and clinical entity extraction for ${s.caregiverName} (${s.interviewType}) awaiting clinical confirmation.`,
        module: "Care Givers",
        recordId: s.sessionId,
        recordHref: `/caregivers/voice-screening/${s.sessionId}`,
        status: "Awaiting Review",
        priority: "High",
        ownership: "Escalated / Senior Review",
        assignedOperatorName: CURRENT_USER.name,
        createdAt: s.date,
        waitingDurationText: "2 days waiting",
        primaryActionLabel: "Review & Sync Interview",
        actionHref: `/caregivers/voice-screening/${s.sessionId}`,
      });
    } else if (s.sessionStatus === "Interrupted" || s.reviewStatus === "Requires Follow-up") {
      allTasks.push({
        id: `tsk-iv-fol-${s.sessionId}`,
        title: "Interview Interrupted / Follow-up Required",
        description: `Session for ${s.caregiverName} was disconnected or flagged. Incomplete schedule and availability answers.`,
        module: "Care Givers",
        recordId: s.sessionId,
        recordHref: `/caregivers/voice-screening/${s.sessionId}`,
        status: "Requires Follow-up",
        priority: "Critical",
        ownership: "Unassigned",
        createdAt: s.date,
        waitingDurationText: "1 day waiting",
        primaryActionLabel: "Inspect & Trigger Follow-up",
        actionHref: `/caregivers/voice-screening/${s.sessionId}`,
      });
    }
  });

  MOCK_CAREGIVERS_DB.forEach((cg) => {
    if (cg.approvalStatus === "Pending Human Review") {
      allTasks.push({
        id: `tsk-cg-appr-${cg.id}`,
        title: "Caregiver Awaiting Final Approval",
        description: `${cg.personal.fullName.value} (${cg.professional.primaryDiscipline.value}) credentials and onboarding ready for talent-pool entry decision.`,
        module: "Care Givers",
        recordId: cg.id,
        recordHref: `/caregivers/${cg.id}`,
        status: "Pending Approval",
        priority: "High",
        ownership: "Escalated / Senior Review",
        assignedOperatorName: CURRENT_USER.name,
        createdAt: "2026-11-05",
        waitingDurationText: "18 hours waiting",
        primaryActionLabel: "Review Caregiver & Approve",
        actionHref: `/caregivers/${cg.id}`,
      });
    }
  });

  // Post-Match Processing & Credentialing
  MOCK_POST_MATCH_DB.forEach((pm) => {
    if (pm.readinessStatus === "Ready for Human Review") {
      allTasks.push({
        id: `tsk-pm-${pm.id}`,
        title: "Post-Match Credentialing Review Awaiting Decision",
        description: `Case-specific checklist verification for ${pm.caregiverName} on case ${pm.caseId} requires operator clearance.`,
        module: "Care Givers",
        recordId: pm.id,
        recordHref: `/post-match/${pm.id}`,
        status: "Review Pending",
        priority: "High",
        ownership: "Assigned to Me",
        assignedOperatorName: CURRENT_USER.name,
        createdAt: pm.dateEntered.split(" ")[0],
        waitingDurationText: "1 day waiting",
        primaryActionLabel: "Open Verification Desk",
        actionHref: `/post-match/${pm.id}`,
      });
    } else if (pm.readinessStatus === "Blocked") {
      allTasks.push({
        id: `tsk-pm-blk-${pm.id}`,
        title: "Post-Match Processing Blocked by Open Exception",
        description: `Exception flagged on ${pm.caregiverName} for patient ${pm.patientName}. Clarification required before placement.`,
        module: "Care Givers",
        recordId: pm.id,
        recordHref: `/post-match/${pm.id}`,
        status: "Blocked",
        priority: "Critical",
        ownership: "Assigned to Me",
        assignedOperatorName: CURRENT_USER.name,
        createdAt: pm.dateEntered.split(" ")[0],
        waitingDurationText: "2 hours waiting",
        primaryActionLabel: "Resolve Exception",
        actionHref: `/post-match/${pm.id}`,
      });
    }
  });

  // Placements
  MOCK_PLACEMENTS_DB.forEach((p) => {
    if (p.caregiverResponseStatus === "Not Contacted") {
      allTasks.push({
        id: `tsk-plc-cnt-${p.id}`,
        title: "New Placement Awaiting Caregiver Contact",
        description: `Selected caregiver ${p.caregiverName} has not been notified of assignment for patient ${p.patientName}.`,
        module: "Placements",
        recordId: p.id,
        recordHref: `/placements/${p.id}`,
        status: "Not Contacted",
        priority: "Critical",
        ownership: "Assigned to Me",
        assignedOperatorName: CURRENT_USER.name,
        createdAt: p.createdAt.split(" ")[0],
        waitingDurationText: "2 hours waiting",
        primaryActionLabel: "Log Outreach & Contact",
        actionHref: `/placements/${p.id}`,
      });
    } else if (p.caregiverResponseStatus === "Declined" && !p.replacementPlacementId) {
      allTasks.push({
        id: `tsk-plc-dec-${p.id}`,
        title: "Caregiver Declined Assignment — Replacement Required",
        description: `${p.caregiverName} declined assignment for case ${p.caseId}. Select a replacement clinician.`,
        module: "Placements",
        recordId: p.id,
        recordHref: `/placements/${p.id}`,
        status: "Declined",
        priority: "Critical",
        ownership: "Assigned to Me",
        assignedOperatorName: CURRENT_USER.name,
        createdAt: p.createdAt.split(" ")[0],
        waitingDurationText: "3 hours waiting",
        primaryActionLabel: "Find Replacement Caregiver",
        actionHref: `/referrals/${p.caseId}`,
      });
    } else if (
      p.caregiverResponseStatus === "Accepted" &&
      p.coordinationStatus !== "Completed" &&
      p.lifecycleStatus !== "Active"
    ) {
      allTasks.push({
        id: `tsk-plc-coord-${p.id}`,
        title: "Assignment Coordination Incomplete",
        description: `Caregiver ${p.caregiverName} accepted. ${p.tasks.filter((t) => !t.isCompleted).length} coordination tasks pending before activation.`,
        module: "Placements",
        recordId: p.id,
        recordHref: `/placements/${p.id}`,
        status: "Coordination Pending",
        priority: "Standard",
        ownership: "Assigned to Others",
        assignedOperatorName: "Nurse Dispatch Coord",
        createdAt: p.createdAt.split(" ")[0],
        waitingDurationText: "1 day waiting",
        primaryActionLabel: "Open Coordination Desk",
        actionHref: `/placements/${p.id}`,
      });
    }
  });

  const assignedToMe = allTasks.filter((t) => t.ownership === "Assigned to Me");
  const unassigned = allTasks.filter((t) => t.ownership === "Unassigned");
  const assignedToOthers = allTasks.filter((t) => t.ownership === "Assigned to Others");
  const seniorReview = allTasks.filter((t) => t.ownership === "Escalated / Senior Review");

  // 3. Pipeline Summaries
  const referralPipeline: PipelineStageSummary[] = [
    { stageKey: "received", label: "Received", count: MOCK_CASES_DB.length, href: "/referrals" },
    {
      stageKey: "validation",
      label: "Human Validation",
      count: MOCK_CASES_DB.filter((c) => c.validationStatus === "Awaiting Validation").length,
      href: "/referrals",
    },
    {
      stageKey: "matching",
      label: "Matching Ready",
      count: MOCK_CASES_DB.filter((c) => c.matchingStatus === "Recommendations Ready").length,
      href: "/referrals",
    },
    {
      stageKey: "placement",
      label: "In Placement",
      count: MOCK_CASES_DB.filter((c) => c.humanReviewStatus === "Approved").length,
      href: "/placements",
    },
  ];

  const caregiverPipeline: PipelineStageSummary[] = [
    { stageKey: "applications", label: "Applications", count: MOCK_CAREGIVERS_DB.length, href: "/caregivers" },
    {
      stageKey: "interviews",
      label: "AI Interviews In Progress",
      count: MOCK_INTERVIEW_SESSIONS.filter((s) => s.sessionStatus === "In Progress" || s.sessionStatus === "Interrupted").length,
      href: "/caregivers/voice-screening",
    },
    {
      stageKey: "review",
      label: "Awaiting Human Review",
      count: MOCK_INTERVIEW_SESSIONS.filter((s) => s.reviewStatus === "Awaiting Human Review").length,
      href: "/caregivers/voice-screening",
    },
    {
      stageKey: "eligible",
      label: "Eligible Talent Pool",
      count: eligibleCaregivers,
      href: "/caregivers",
    },
  ];

  const placementPipeline: PipelineStageSummary[] = [
    {
      stageKey: "created",
      label: "Created / Uncontacted",
      count: MOCK_PLACEMENTS_DB.filter((p) => p.caregiverResponseStatus === "Not Contacted").length,
      href: "/placements",
    },
    {
      stageKey: "pending_response",
      label: "Pending Caregiver Response",
      count: MOCK_PLACEMENTS_DB.filter((p) => p.caregiverResponseStatus === "Contact Pending").length,
      href: "/placements",
    },
    {
      stageKey: "coordinating",
      label: "Accepted & Coordinating",
      count: MOCK_PLACEMENTS_DB.filter((p) => p.caregiverResponseStatus === "Accepted" && p.lifecycleStatus !== "Active").length,
      href: "/placements",
    },
    {
      stageKey: "active",
      label: "Active In-Home Care",
      count: activePlacements,
      href: "/placements",
    },
    {
      stageKey: "completed",
      label: "Completed / Discharged",
      count: MOCK_PLACEMENTS_DB.filter((p) => p.lifecycleStatus === "Completed").length,
      href: "/placements",
    },
  ];

  // 4. Chronological Activity
  const recentActivity: AggregatedActivityItem[] = [
    {
      id: "act-1",
      timestamp: "Today at 11:30",
      module: "Placements",
      actor: CURRENT_USER.name,
      action: "Placement Created",
      details: "Official placement PLC-601 created for patient Elena Rostova (Assigned: Elena V. Rostova, RN-WCC).",
      recordId: "PLC-601",
      recordHref: "/placements/PLC-601",
    },
    {
      id: "act-2",
      timestamp: "Today at 09:28",
      module: "Care Givers",
      actor: "Voice AI Ingestion Engine",
      action: "Voice Screening Completed",
      details: "Session IV-9014 (Marcus Brody) finished NLP parsing. 5 entity categories extracted.",
      recordId: "IV-9014",
      recordHref: "/caregivers/voice-screening/IV-9014",
    },
    {
      id: "act-3",
      timestamp: "Yesterday at 16:40",
      module: "Cases & Referrals",
      actor: CURRENT_USER.name,
      action: "Referral Validated",
      details: "Case REF-4091 validated. Deterministic matching engine calculated 2 candidate matches.",
      recordId: "REF-4091",
      recordHref: "/referrals/REF-4091",
    },
  ];

  // 5. Operational Exceptions
  const exceptions: OperationalExceptionItem[] = [
    {
      id: "exc-1",
      category: "Voice Telephony Interruption",
      module: "Care Givers",
      recordId: "IV-9015",
      recordHref: "/caregivers/voice-screening/IV-9015",
      description: "Screening session dropped carrier connection at minute 4. Missing availability capacity answers.",
      status: "Open",
      detectedAt: "2026-11-06",
      assignedOperator: CURRENT_USER.name,
      nextActionLabel: "Schedule Follow-up Interview",
      actionHref: "/caregivers/voice-screening/IV-9015",
    },
  ];

  // Ingest unresolved post-match exceptions into operational exceptions queue
  MOCK_POST_MATCH_DB.forEach((pm) => {
    pm.exceptions.forEach((e) => {
      if (e.status !== "Resolved") {
        exceptions.push({
          id: `exc-pm-${e.id}`,
          category: e.category,
          module: "Care Givers",
          recordId: pm.id,
          recordHref: `/post-match/${pm.id}`,
          description: e.description,
          status: e.status === "Open" ? "Open" : "In Review",
          detectedAt: e.detectedAt,
          assignedOperator: e.assignedOperator,
          nextActionLabel: "Resolve Exception",
          actionHref: `/post-match/${pm.id}`,
        });
      }
    });
  });

  return {
    metrics: {
      totalReferrals,
      referralsAwaitingValidation,
      eligibleCaregivers,
      applicationsAwaitingReview,
      pendingPlacements,
      activePlacements,
    },
    tasks: {
      assignedToMe,
      unassigned,
      assignedToOthers,
      seniorReview,
      totalOutstanding: allTasks.length,
    },
    referralPipeline,
    caregiverPipeline,
    placementPipeline,
    recentActivity,
    exceptions,
    lastUpdatedTimestamp: now.toISOString().replace("T", " ").substring(0, 16),
  };
}