// lib/bulk-import-service.ts
import { BulkImportBatch, StagedReferralRecord, CaseRecord, CareScheduleRequirements } from "@/types/referral";
import { MOCK_CASES_DB } from "@/lib/referral-service";

export const MOCK_BULK_BATCHES: BulkImportBatch[] = [
  {
    batchId: "BATCH-2026-081",
    importMethod: "spreadsheet",
    referralSource: "Keystone Care Connector Roster",
    uploadedBy: "Dr. R. Sterling",
    uploadedAt: "2026-11-06 08:30",
    sourceFiles: ["keystone_q4_referrals_intake.xlsx"],
    totalRecordsDetected: 4,
    successfullyImported: 3,
    failedRecords: 1,
    flaggedDuplicates: 1,
    status: "Completed with Errors",
    records: [
      {
        tempId: "rec-1",
        rowNumber: 2,
        sourceFile: "keystone_q4_referrals_intake.xlsx",
        rawData: { "Full Name": "Elena Rostova", "Birth Date": "1964-07-22", "ZIP": "15213", "Discipline": "RN-WCC", "Hours": "18" },
        parsedFields: { patientName: "Elena Rostova", dob: "1964-07-22", zipCode: "15213", careDiscipline: "Wound Care Certified Nurse (RN-WCC)", authorizedHours: 18, clinicalNotes: "Stasis ulcer dressings" },
        isValid: true,
        validationErrors: [],
        isPotentialDuplicate: true,
        duplicateMatchId: "REF-4091",
        isExcluded: false,
        createdReferralId: "REF-4091",
        recordStatus: "Potential Duplicate",
      },
      {
        tempId: "rec-2",
        rowNumber: 3,
        sourceFile: "keystone_q4_referrals_intake.xlsx",
        rawData: { "Full Name": "Charles Danvers", "Birth Date": "1958-03-14", "ZIP": "15206", "Discipline": "Physical Therapist (PT)", "Hours": "12" },
        parsedFields: { patientName: "Charles Danvers", dob: "1958-03-14", zipCode: "15206", careDiscipline: "Physical Therapist (PT)", authorizedHours: 12, clinicalNotes: "Gait and transfer stabilization" },
        isValid: true,
        validationErrors: [],
        isPotentialDuplicate: false,
        isExcluded: false,
        createdReferralId: "REF-4093",
        recordStatus: "Awaiting Validation",
      },
      {
        tempId: "rec-3",
        rowNumber: 4,
        sourceFile: "keystone_q4_referrals_intake.xlsx",
        rawData: { "Full Name": "Miriam Gomez", "Birth Date": "1949-11-02", "ZIP": "15232", "Discipline": "Home Health Aide (HHA)", "Hours": "20" },
        parsedFields: { patientName: "Miriam Gomez", dob: "1949-11-02", zipCode: "15232", careDiscipline: "Home Health Aide (HHA)", authorizedHours: 20, clinicalNotes: "ADL assistance and memory cues" },
        isValid: true,
        validationErrors: [],
        isPotentialDuplicate: false,
        isExcluded: false,
        createdReferralId: "REF-4094",
        recordStatus: "Awaiting Validation",
      },
      {
        tempId: "rec-4",
        rowNumber: 5,
        sourceFile: "keystone_q4_referrals_intake.xlsx",
        rawData: { "Full Name": "", "Birth Date": "1982-01-19", "ZIP": "99999", "Discipline": "RN", "Hours": "0" },
        parsedFields: { patientName: "", dob: "1982-01-19", zipCode: "99999", careDiscipline: "Registered Nurse (RN)", authorizedHours: 0, clinicalNotes: "Intake missing patient name and hours" },
        isValid: false,
        validationErrors: ["Patient name is missing", "Authorized hours must be greater than 0"],
        isPotentialDuplicate: false,
        isExcluded: true,
        recordStatus: "Invalid",
      },
    ],
  },
];

export function executeBatchCommit(batch: BulkImportBatch): CaseRecord[] {
  const createdCases: CaseRecord[] = [];
  const safeReferralSource = batch.referralSource || "Bulk Ingestion Channel";

  batch.records.forEach((rec) => {
    if (rec.isExcluded || !rec.isValid) return;

    const newCaseId = rec.createdReferralId || `REF-${Math.floor(4100 + Math.random() * 899)}`;
    rec.createdReferralId = newCaseId;
    rec.recordStatus = rec.isPotentialDuplicate ? "Potential Duplicate" : "Awaiting Validation";

    const defaultSchedule: CareScheduleRequirements = {
      startDate: { value: "", state: "missing" },
      requiredDays: { value: [], state: "missing" },
      timeWindows: { value: [], state: "missing" },
      hoursPerWeek: { value: rec.parsedFields.authorizedHours || 0, state: "ai-extracted" },
      recurringType: { value: "Recurring Weekly", state: "missing" },
      careTimeZone: { value: "America/New_York (ET)", state: "ai-extracted" },
      schedulingConstraints: { value: "", state: "missing" },
      sourceDocumentRef: rec.sourceFile || "batch-file",
    };

    const newCase: CaseRecord = {
      id: newCaseId,
      referralSource: safeReferralSource,
      dateReceived: batch.uploadedAt.split(" ")[0],
      intakeMethod: batch.importMethod === "spreadsheet" ? "spreadsheet" : "document",
      internalNotes: `Bulk Ingested via Batch ${batch.batchId} (${batch.importMethod}) from file: ${rec.sourceFile}`,
      uploadedBy: batch.uploadedBy,
      intakeStatus: "Received",
      duplicateStatus: rec.isPotentialDuplicate ? "Potential Duplicate" : "Clear",
      potentialDuplicateOfCaseId: rec.duplicateMatchId,
      extractionStatus: "Completed",
      validationStatus: "Awaiting Validation",
      matchingStatus: "Not Started",
      humanReviewStatus: "Awaiting Review",
      schedulingStatus: "Incomplete",
      validatedProfileVersion: 0,
      validatedProfileHistory: [],
      sourceDocuments: [
        {
          id: `doc-${Date.now()}-${rec.rowNumber}`,
          name: rec.sourceFile,
          fileName: rec.sourceFile,
          type: batch.importMethod === "spreadsheet" ? "spreadsheet" : "pdf",
          fileType: batch.importMethod === "spreadsheet" ? "Spreadsheet / Care Connector" : "Hospital Discharge PDF",
          uploadedAt: batch.uploadedAt,
          uploadedBy: batch.uploadedBy,
          fileSize: "Imported Record",
          rawContent: JSON.stringify(rec.rawData, null, 2),
          rawTextPreview: JSON.stringify(rec.rawData, null, 2),
        },
      ],
      draftProfile: {
        patientName: { value: rec.parsedFields.patientName, state: "ai-extracted" },
        dob: { value: rec.parsedFields.dob, state: "ai-extracted" },
        dateOfBirth: { value: rec.parsedFields.dob, state: "ai-extracted" },
        age: { value: 65, state: "ai-extracted" },
        zipCode: { value: rec.parsedFields.zipCode, state: rec.parsedFields.zipCode ? "ai-extracted" : "missing" },
        primaryCondition: { value: rec.parsedFields.clinicalNotes || "Primary Referral Need", state: "ai-extracted" },
        careDisciplineRequired: { value: rec.parsedFields.careDiscipline, state: "ai-extracted" },
        authorizedHoursPerWeek: { value: rec.parsedFields.authorizedHours, state: "ai-extracted" },
        shiftPreference: { value: "Flexible Daytime", state: "uncertain" },
        clinicalNotesSummary: { value: rec.parsedFields.clinicalNotes, state: "ai-extracted" },
        missingRequiredFields: rec.parsedFields.zipCode ? [] : ["ZIP Code"],
        schedule: defaultSchedule,
      },
      recommendations: [],
      activityLogs: [
        {
          id: `log-b-${Date.now()}-${rec.rowNumber}`,
          timestamp: batch.uploadedAt,
          actor: batch.uploadedBy,
          action: "Bulk Ingestion Created",
          details: `Imported via Batch ${batch.batchId} (Row ${rec.rowNumber}). Pre-import duplicate check: ${rec.isPotentialDuplicate ? "Duplicate Flagged" : "Clear"}`,
        },
      ],
    };

    createdCases.push(newCase);
    MOCK_CASES_DB.unshift(newCase);
  });

  return createdCases;
}