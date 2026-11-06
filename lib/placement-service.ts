// lib/placement-service.ts
import { PlacementRecord } from "@/types/placement";
import { MOCK_CASES_DB } from "@/lib/referral-service";

export const MOCK_PLACEMENTS_DB: PlacementRecord[] = [
  {
    id: "PLC-601",
    caseId: "REF-4091",
    patientName: "Elena Rostova",
    patientZip: "15213",
    careDisciplineRequired: "Wound Care Certified Nurse (RN-WCC)",
    authorizedHoursPerWeek: 18,
    referralProfileVersion: 1,

    caregiverId: "CG-8012",
    caregiverName: "Elena V. Rostova",
    caregiverDiscipline: "Wound Care Certified Nurse (RN-WCC)",
    caregiverPhone: "(412) 555-0192",
    caregiverMatchRank: 1,

    lifecycleStatus: "Active",
    caregiverResponseStatus: "Accepted",
    coordinationStatus: "Completed",
    serviceStatus: "In Progress",

    createdBy: "Dr. R. Sterling (Lead Clinical Dispatcher)",
    createdAt: "2026-11-04 11:30",
    acceptedAt: "2026-11-04 13:15",
    activatedBy: "Dr. R. Sterling",
    activatedAt: "2026-11-05 08:00",

    contacts: [
      {
        id: "cnt-1",
        placementId: "PLC-601",
        method: "Phone Call",
        timestamp: "2026-11-04 12:45",
        contactedBy: "Dr. R. Sterling",
        outcome: "Spoke with Caregiver",
        notes: "Explained NPWT dress renewals 3x weekly; caregiver verbally accepted immediately.",
      },
    ],
    responses: [
      {
        id: "rsp-1",
        placementId: "PLC-601",
        responseType: "Accepted",
        timestamp: "2026-11-04 13:15",
        responseChannel: "Direct Phone Call",
        recordedBy: "Dr. R. Sterling",
      },
    ],
    tasks: [
      {
        id: "tsk-1",
        placementId: "PLC-601",
        title: "Confirm Patient Address & Access Code",
        description: "Verify building entrance buzzer code and emergency contact phone number.",
        isCompleted: true,
        assignedTo: "Dr. R. Sterling",
        dueDate: "2026-11-04",
        completedAt: "2026-11-04 14:00",
      },
      {
        id: "tsk-2",
        placementId: "PLC-601",
        title: "Verify Active NPWT Consumables Delivery",
        description: "Ensure KCI wound canister supplies are on site.",
        isCompleted: true,
        assignedTo: "Dr. R. Sterling",
        dueDate: "2026-11-04",
        completedAt: "2026-11-04 16:30",
      },
    ],
    issues: [],
    activityLogs: [
      {
        id: "log-1",
        timestamp: "2026-11-04 11:30",
        actor: "Dr. R. Sterling",
        action: "Official Placement Created",
        details: "Selected rank #1 caregiver Elena V. Rostova from deterministic matching recommendations.",
      },
      {
        id: "log-2",
        timestamp: "2026-11-04 13:15",
        actor: "Dr. R. Sterling",
        action: "Caregiver Accepted Assignment",
        details: "Acceptance confirmed over phone dispatch.",
      },
      {
        id: "log-3",
        timestamp: "2026-11-05 08:00",
        actor: "Dr. R. Sterling",
        action: "Placement Activated",
        details: "All coordination requirements confirmed satisfied. Service delivery initiated.",
      },
    ],
  },
  {
    id: "PLC-602",
    caseId: "REF-4093",
    patientName: "Charles Danvers",
    patientZip: "15206",
    careDisciplineRequired: "Physical Therapist (PT)",
    authorizedHoursPerWeek: 12,
    referralProfileVersion: 1,

    caregiverId: "CG-8013",
    caregiverName: "Marcus Brody",
    caregiverDiscipline: "Physical Therapist (PT)",
    caregiverPhone: "(412) 555-7741",
    caregiverMatchRank: 1,

    lifecycleStatus: "Created",
    caregiverResponseStatus: "Not Contacted",
    coordinationStatus: "Not Started",
    serviceStatus: "Not Started",

    createdBy: "Dr. R. Sterling (Lead Clinical Dispatcher)",
    createdAt: "2026-11-06 09:15",

    contacts: [],
    responses: [],
    tasks: [
      {
        id: "tsk-3",
        placementId: "PLC-602",
        title: "Initial Outreach Call",
        description: "Dispatch assignment scope (12 hrs/wk post-stroke transfer stability).",
        isCompleted: false,
        assignedTo: "Dr. R. Sterling",
        dueDate: "2026-11-06",
      },
    ],
    issues: [],
    activityLogs: [
      {
        id: "log-4",
        timestamp: "2026-11-06 09:15",
        actor: "Dr. R. Sterling",
        action: "Official Placement Created",
        details: "Selected rank #1 PT candidate Marcus Brody from Case REF-4093 recommendations.",
      },
    ],
  },
];

export function getPlacementById(id: string): PlacementRecord | undefined {
  return MOCK_PLACEMENTS_DB.find((p) => p.id.toLowerCase() === id.toLowerCase());
}

export function createOfficialPlacement(
  caseId: string,
  caregiverId: string,
  caregiverName: string,
  caregiverDiscipline: string,
  caregiverPhone: string,
  caregiverMatchRank: number,
  operatorName: string
): PlacementRecord {
  const caseRecord = MOCK_CASES_DB.find((c) => c.id === caseId);

  const placementId = `PLC-${Math.floor(610 + Math.random() * 380)}`;
  const now = new Date().toISOString().replace("T", " ").substring(0, 16);

  const newPlacement: PlacementRecord = {
    id: placementId,
    caseId,
    patientName: caseRecord ? caseRecord.draftProfile.patientName.value : "Case Patient",
    patientZip: caseRecord ? caseRecord.draftProfile.zipCode.value : "15213",
    careDisciplineRequired: caseRecord ? caseRecord.draftProfile.careDisciplineRequired.value : caregiverDiscipline,
    authorizedHoursPerWeek: caseRecord ? caseRecord.draftProfile.authorizedHoursPerWeek.value : 14,
    referralProfileVersion: caseRecord?.validatedProfileVersion || 1,

    caregiverId,
    caregiverName,
    caregiverDiscipline,
    caregiverPhone,
    caregiverMatchRank,

    lifecycleStatus: "Created",
    caregiverResponseStatus: "Not Contacted",
    coordinationStatus: "Not Started",
    serviceStatus: "Not Started",

    createdBy: operatorName,
    createdAt: now,

    contacts: [],
    responses: [],
    tasks: [
      {
        id: `tsk-${Date.now()}-1`,
        placementId,
        title: "Caregiver Contact & Outreach",
        description: `Contact ${caregiverName} to communicate clinical directives and verify availability.`,
        isCompleted: false,
        assignedTo: operatorName,
        dueDate: now.split(" ")[0],
      },
    ],
    issues: [],
    activityLogs: [
      {
        id: `log-${Date.now()}`,
        timestamp: now,
        actor: operatorName,
        action: "Official Placement Created",
        details: `Operator confirmed selection of ${caregiverName} (Rank #${caregiverMatchRank}) for Case ${caseId}.`,
      },
    ],
  };

  MOCK_PLACEMENTS_DB.unshift(newPlacement);

  if (caseRecord) {
    caseRecord.humanReviewStatus = "Approved";
    caseRecord.activityLogs.unshift({
      id: `log-c-${Date.now()}`,
      timestamp: now,
      actor: operatorName,
      action: "Placement Initiated",
      details: `Created official placement record ${placementId} with caregiver ${caregiverName}.`,
    });
  }

  return newPlacement;
}