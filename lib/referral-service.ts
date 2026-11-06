// lib/referral-service.ts
import {
    CaseRecord,
    CaregiverMatchingRecommendation,
    ScheduleCompatibilityOutcome,
    DayOfWeek,
  } from "@/types/referral";
  import { MOCK_CAREGIVERS_DB } from "@/lib/caregiver-service";
  
  export function evaluateScheduleCompatibility(
    caseRecord: CaseRecord,
    caregiverId: string
  ): {
    outcome: ScheduleCompatibilityOutcome;
    details: string;
    overlappingDays: DayOfWeek[];
    conflictingDays: DayOfWeek[];
  } {
    const caregiver = MOCK_CAREGIVERS_DB.find((c) => c.id === caregiverId);
    const requiredDays = caseRecord.draftProfile.schedule.requiredDays.value || [];
    const requiredWindows = caseRecord.draftProfile.schedule.timeWindows.value || [];
  
    if (!caregiver) {
      return {
        outcome: "Unverified / Stale Availability",
        details: "Caregiver record not found in registered roster.",
        overlappingDays: [],
        conflictingDays: requiredDays,
      };
    }
  
    if (requiredDays.length === 0) {
      return {
        outcome: "Unverified / Stale Availability",
        details: "Patient care days are not specified. Cannot evaluate schedule compatibility.",
        overlappingDays: [],
        conflictingDays: [],
      };
    }
  
    const overlapping: DayOfWeek[] = [];
    const conflicting: DayOfWeek[] = [];
  
    requiredDays.forEach((day) => {
      const slot = caregiver.availability.weeklySlots.find(
        (s) => s.day.toLowerCase() === day.toLowerCase() && s.enabled
      );
  
      if (!slot) {
        conflicting.push(day);
        return;
      }
  
      // Check time window compatibility if requested
      const morningMatch = requiredWindows.some((w) => w.startsWith("Morning")) && slot.morning;
      const aftMatch = requiredWindows.some((w) => w.startsWith("Afternoon")) && slot.afternoon;
      const eveMatch = requiredWindows.some((w) => w.startsWith("Evening")) && slot.evening;
      const flexible = requiredWindows.includes("Flexible") || requiredWindows.length === 0;
  
      if (flexible || morningMatch || aftMatch || eveMatch) {
        overlapping.push(day);
      } else {
        conflicting.push(day);
      }
    });
  
    if (overlapping.length === requiredDays.length) {
      return {
        outcome: "Full Schedule Match",
        details: `Full alignment across all ${requiredDays.length} requested days (${overlapping.join(", ")}).`,
        overlappingDays: overlapping,
        conflictingDays: [],
      };
    }
  
    if (overlapping.length > 0) {
      return {
        outcome: "Partial Match",
        details: `Matches ${overlapping.length}/${requiredDays.length} days (${overlapping.join(", ")}). Conflicting on ${conflicting.join(", ")}.`,
        overlappingDays: overlapping,
        conflictingDays: conflicting,
      };
    }
  
    return {
      outcome: "Schedule Incompatible",
      details: `No reported coverage for requested days (${conflicting.join(", ")}).`,
      overlappingDays: [],
      conflictingDays: conflicting,
    };
  }
  
  export function executeDeterministicMatching(caseRecord: CaseRecord): CaregiverMatchingRecommendation[] {
    const requiredDiscipline = caseRecord.draftProfile.careDisciplineRequired.value.toLowerCase();
  
    return MOCK_CAREGIVERS_DB.filter((cg) => {
      return (
        cg.approvalStatus === "Approved" &&
        cg.professional.primaryDiscipline.value.toLowerCase().includes(requiredDiscipline.slice(0, 4))
      );
    })
      .map((cg, index) => {
        const scheduleEval = evaluateScheduleCompatibility(caseRecord, cg.id);
        let matchScore = 80 - index * 6;
  
        if (scheduleEval.outcome === "Full Schedule Match") matchScore += 18;
        else if (scheduleEval.outcome === "Partial Match") matchScore += 6;
        else if (scheduleEval.outcome === "Schedule Incompatible") matchScore -= 20;
  
        return {
          caregiverId: cg.id,
          caregiverName: cg.personal.fullName.value,
          discipline: cg.professional.primaryDiscipline.value,
          matchScore: Math.min(99, Math.max(45, matchScore)),
          distanceMiles: 3.2 + index * 1.5,
          activeCaseload: 2,
          maxCaseload: 4,
          matchingRationale: `Direct discipline alignment (${cg.professional.primaryDiscipline.value}) with verified territory proximity.`,
          credentials: cg.documents.filter((d) => d.reviewStatus === "Verified").map((d) => d.category),
          scheduleCompatibility: scheduleEval,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }
  
  export const MOCK_CASES_DB: CaseRecord[] = [
    {
      id: "REF-4091",
      referralSource: "UPMC Shadyside Discharge Planning",
      dateReceived: "2026-11-04",
      uploaderName: "Dr. R. Sterling",
      receivedNotes: "Urgent post-op surgical discharge. NPWT dressing protocol required.",
      duplicateStatus: "Clear",
      extractionStatus: "Completed",
      validationStatus: "Validated",
      matchingStatus: "Recommendations Ready",
      humanReviewStatus: "Awaiting Review",
      schedulingStatus: "Confirmed",
      validatedProfileVersion: 1,
      validatedBy: "Dr. R. Sterling",
      validatedAt: "2026-11-04 11:15",
      sourceDocuments: [
        {
          id: "doc-1",
          fileName: "UPMC_Discharge_Summary_E_Rostova.pdf",
          fileType: "Hospital Discharge PDF",
          uploadedAt: "2026-11-04 09:20",
          uploadedBy: "Dr. R. Sterling",
          fileSize: "1.4 MB",
          rawTextPreview: "PATIENT: Elena Rostova. DOB: 1964-08-12. DX: Stasis Ulcer requiring NPWT 3x weekly MWF.",
        },
        {
          id: "doc-2",
          fileName: "Physician_NPWT_Signed_Order.pdf",
          fileType: "Fax Transmission",
          uploadedAt: "2026-11-04 09:25",
          uploadedBy: "Dr. R. Sterling",
          fileSize: "640 KB",
          rawTextPreview: "Authorized 18 hours/week. Monday, Wednesday, Friday morning visits mandatory.",
        },
      ],
      draftProfile: {
        patientName: { value: "Elena Rostova", state: "Human Confirmed" },
        dateOfBirth: { value: "1964-08-12", state: "Human Confirmed" },
        zipCode: { value: "15213", state: "Human Confirmed" },
        careDisciplineRequired: { value: "Wound Care Certified Nurse (RN-WCC)", state: "Human Confirmed" },
        authorizedHoursPerWeek: { value: 18, state: "Human Confirmed" },
        clinicalNotesSummary: {
          value: "Post-op bilateral venous stasis ulcer care. Patient requires negative pressure wound therapy (NPWT) canister changes and sterile debridement.",
          state: "Human Confirmed",
        },
        missingRequiredFields: [],
        schedule: {
          startDate: { value: "2026-11-08", state: "Human Confirmed" },
          requiredDays: { value: ["Monday", "Wednesday", "Friday"], state: "Human Confirmed" },
          timeWindows: { value: ["Morning (08:00 - 12:00)"], state: "Human Confirmed" },
          hoursPerWeek: { value: 18, state: "Human Confirmed" },
          recurringType: { value: "Recurring Weekly", state: "Human Confirmed" },
          careTimeZone: { value: "America/New_York (ET)", state: "Human Confirmed" },
          schedulingConstraints: {
            value: "Caregiver must arrive between 08:30 and 11:30 AM before physical therapy sessions.",
            state: "Human Confirmed",
          },
          sourceDocumentRef: "Physician_NPWT_Signed_Order.pdf",
        },
      },
      validatedProfileHistory: [],
      recommendations: [
        {
          caregiverId: "CG-8012",
          caregiverName: "Elena V. Rostova",
          discipline: "Wound Care Certified Nurse (RN-WCC)",
          matchScore: 98,
          distanceMiles: 3.4,
          activeCaseload: 2,
          maxCaseload: 4,
          matchingRationale: "Direct RN-WCC discipline match with NPWT expertise and 3.4-mile commute proximity.",
          credentials: ["RN License (PA Active)", "Wound Care Certification (WCC)"],
          scheduleCompatibility: {
            outcome: "Full Schedule Match",
            details: "Caregiver is verified available Monday, Wednesday, Friday morning slots.",
            overlappingDays: ["Monday", "Wednesday", "Friday"],
            conflictingDays: [],
          },
        },
      ],
      activityLogs: [
        {
          id: "log-1",
          timestamp: "2026-11-04 11:15",
          actor: "Dr. R. Sterling",
          action: "Validation Completed & Matching Initiated",
          details: "Human validation cleared profile v1. Deterministic matching evaluated 1 candidate with full schedule compatibility.",
        },
      ],
    },
    {
      id: "REF-4093",
      referralSource: "Keystone Health Plan Central Intake",
      dateReceived: "2026-11-05",
      uploaderName: "Referral Coord T. Davis",
      receivedNotes: "Physical therapy in-home post-CVA rehabilitation.",
      duplicateStatus: "Clear",
      extractionStatus: "Completed",
      validationStatus: "Awaiting Validation",
      matchingStatus: "Not Started",
      humanReviewStatus: "Awaiting Review",
      schedulingStatus: "Awaiting Confirmation",
      validatedProfileVersion: 0,
      sourceDocuments: [
        {
          id: "doc-3",
          fileName: "Keystone_Intake_Form_Danvers.pdf",
          fileType: "Spreadsheet / Care Connector",
          uploadedAt: "2026-11-05 08:30",
          uploadedBy: "Referral Coord T. Davis",
          fileSize: "820 KB",
          rawTextPreview: "Patient: Charles Danvers. DOB: 1958-03-22. Needs in-home PT 12 hours/week Tuesday & Thursday.",
        },
      ],
      draftProfile: {
        patientName: { value: "Charles Danvers", state: "AI Extracted", extractedConfidence: 0.96 },
        dateOfBirth: { value: "1958-03-22", state: "AI Extracted", extractedConfidence: 0.99 },
        zipCode: { value: "15206", state: "AI Extracted", extractedConfidence: 0.94 },
        careDisciplineRequired: { value: "Physical Therapist (PT)", state: "AI Extracted", extractedConfidence: 0.98 },
        authorizedHoursPerWeek: { value: 12, state: "AI Extracted", extractedConfidence: 0.92 },
        clinicalNotesSummary: {
          value: "Post-stroke right hemiparesis. Requires transfer safety drills, gait retraining, and active-assisted ROM.",
          state: "AI Extracted",
        },
        missingRequiredFields: [],
        schedule: {
          startDate: { value: "2026-11-10", state: "AI Extracted" },
          requiredDays: { value: ["Tuesday", "Thursday"], state: "AI Extracted" },
          timeWindows: { value: ["Afternoon (12:00 - 17:00)"], state: "AI Extracted" },
          hoursPerWeek: { value: 12, state: "AI Extracted" },
          recurringType: { value: "Recurring Weekly", state: "AI Extracted" },
          careTimeZone: { value: "America/New_York (ET)", state: "AI Extracted" },
          schedulingConstraints: {
            value: "Daughter present after 1:00 PM for caregiver family training.",
            state: "AI Extracted",
          },
          sourceDocumentRef: "Keystone_Intake_Form_Danvers.pdf",
        },
      },
      validatedProfileHistory: [],
      recommendations: [],
      activityLogs: [
        {
          id: "log-2",
          timestamp: "2026-11-05 08:31",
          actor: "ANC Extraction Engine",
          action: "AI Entity Parsing Completed",
          details: "Structured patient profile and extracted initial Tuesday/Thursday schedule.",
        },
      ],
    },
  ];