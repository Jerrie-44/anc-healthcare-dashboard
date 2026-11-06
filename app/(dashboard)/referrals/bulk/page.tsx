// app/(dashboard)/referrals/bulk/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_BULK_BATCHES, executeBatchCommit } from "@/lib/bulk-import-service";
import { BulkImportMethod, BulkImportBatch, StagedReferralRecord, ColumnMappingConfig } from "@/types/referral";

type WizardStep = "upload" | "mapping" | "preview" | "importing";

const SAMPLE_CSV_HEADERS = [
  "Client Full Name",
  "Date Of Birth",
  "Postal Code",
  "Service Needed",
  "Authorized Hrs",
  "Care Directives",
];

export default function BulkReferralUploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("upload");
  const [importMethod, setImportMethod] = useState<BulkImportMethod>("spreadsheet");
  const [referralSource, setReferralSource] = useState("Keystone Health Connector");
  const [files, setFiles] = useState<string[]>([]);

  // Spreadsheet Column Mapping
  const [detectedHeaders] = useState<string[]>(SAMPLE_CSV_HEADERS);
  const [mapping, setMapping] = useState<ColumnMappingConfig>({
    patientName: "Client Full Name",
    dob: "Date Of Birth",
    zipCode: "Postal Code",
    careDiscipline: "Service Needed",
    authorizedHours: "Authorized Hrs",
    clinicalNotes: "Care Directives",
  });

  // Staged Records for Preview
  const [stagedRecords, setStagedRecords] = useState<StagedReferralRecord[]>([]);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const names = Array.from(e.target.files).map((f) => f.name);
    setFiles(names);
  };

  const processUploadToNextStep = () => {
    if (files.length === 0) {
      setFiles(
        importMethod === "spreadsheet"
          ? ["keystone_connector_intake.xlsx"]
          : ["referral_batch_01.pdf", "referral_batch_02.pdf"]
      );
    }

    if (importMethod === "spreadsheet") {
      setStep("mapping");
    } else {
      generateDocumentStagedRecords();
      setStep("preview");
    }
  };

  const generateSpreadsheetStagedRecords = () => {
    const records: StagedReferralRecord[] = [
      {
        tempId: "tmp-1",
        rowNumber: 2,
        sourceFile: files[0] || "spreadsheet_upload.xlsx",
        rawData: {
          "Client Full Name": "Elena Rostova",
          "Date Of Birth": "1964-07-22",
          "Postal Code": "15213",
          "Service Needed": "RN-WCC",
          "Authorized Hrs": "18",
          "Care Directives": "Venous ulcer dressing renewal",
        },
        parsedFields: {
          patientName: "Elena Rostova",
          dob: "1964-07-22",
          zipCode: "15213",
          careDiscipline: "Wound Care Certified Nurse (RN-WCC)",
          authorizedHours: 18,
          clinicalNotes: "Venous ulcer dressing renewal",
        },
        isValid: true,
        validationErrors: [],
        isPotentialDuplicate: true,
        duplicateMatchId: "REF-4091",
        isExcluded: false,
        recordStatus: "Pending Import",
      },
      {
        tempId: "tmp-2",
        rowNumber: 3,
        sourceFile: files[0] || "spreadsheet_upload.xlsx",
        rawData: {
          "Client Full Name": "Leonard Ross",
          "Date Of Birth": "1952-09-11",
          "Postal Code": "15228",
          "Service Needed": "PT",
          "Authorized Hrs": "10",
          "Care Directives": "Post-stroke mobility re-education",
        },
        parsedFields: {
          patientName: "Leonard Ross",
          dob: "1952-09-11",
          zipCode: "15228",
          careDiscipline: "Physical Therapist (PT)",
          authorizedHours: 10,
          clinicalNotes: "Post-stroke mobility re-education",
        },
        isValid: true,
        validationErrors: [],
        isPotentialDuplicate: false,
        isExcluded: false,
        recordStatus: "Pending Import",
      },
      {
        tempId: "tmp-3",
        rowNumber: 4,
        sourceFile: files[0] || "spreadsheet_upload.xlsx",
        rawData: {
          "Client Full Name": "Patricia Walsh",
          "Date Of Birth": "1975-04-03",
          "Postal Code": "",
          "Service Needed": "RN",
          "Authorized Hrs": "8",
          "Care Directives": "IV infusion monitoring",
        },
        parsedFields: {
          patientName: "Patricia Walsh",
          dob: "1975-04-03",
          zipCode: "",
          careDiscipline: "Registered Nurse (RN)",
          authorizedHours: 8,
          clinicalNotes: "IV infusion monitoring",
        },
        isValid: false,
        validationErrors: ["Missing mandatory postal ZIP code"],
        isPotentialDuplicate: false,
        isExcluded: false,
        recordStatus: "Invalid",
      },
    ];

    setStagedRecords(records);
    setStep("preview");
  };

  const generateDocumentStagedRecords = () => {
    const records: StagedReferralRecord[] = (
      files.length > 0 ? files : ["referral_doc_1.pdf", "referral_doc_2.pdf"]
    ).map((name, idx) => ({
      tempId: `doc-${idx + 1}`,
      rowNumber: idx + 1,
      sourceFile: name,
      rawData: { Document: name },
      parsedFields: {
        patientName: idx === 0 ? "Samuel Brody" : "Cynthia Meyer",
        dob: idx === 0 ? "1960-12-04" : "1971-08-19",
        zipCode: idx === 0 ? "15201" : "15219",
        careDiscipline: idx === 0 ? "Registered Nurse (RN)" : "Home Health Aide (HHA)",
        authorizedHours: idx === 0 ? 14 : 22,
        clinicalNotes:
          idx === 0
            ? "Post-cardiac wound assessment"
            : "Assisted daily living and nutritional oversight",
      },
      isValid: true,
      validationErrors: [],
      isPotentialDuplicate: false,
      isExcluded: false,
      recordStatus: "Pending Import",
    }));

    setStagedRecords(records);
  };

  const toggleExcludeRecord = (tempId: string) => {
    setStagedRecords((prev) =>
      prev.map((r) => ((r.tempId || r.id) === tempId ? { ...r, isExcluded: !r.isExcluded } : r))
    );
  };

  const handleConfirmImport = () => {
    setStep("importing");

    const batchId = `BATCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const validCount = stagedRecords.filter((r) => r.isValid && !r.isExcluded).length;
    const failedCount = stagedRecords.filter((r) => !r.isValid || r.isExcluded).length;
    const dupCount = stagedRecords.filter((r) => r.isPotentialDuplicate && !r.isExcluded).length;

    const newBatch: BulkImportBatch = {
      batchId,
      importMethod,
      referralSource: referralSource || "Standard Ingestion",
      uploadedBy: "Dr. R. Sterling (Lead Clinical Dispatcher)",
      uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      sourceFiles: files,
      totalRecordsDetected: stagedRecords.length,
      successfullyImported: validCount,
      failedRecords: failedCount,
      flaggedDuplicates: dupCount,
      status: failedCount > 0 ? "Completed with Errors" : "Completed",
      records: stagedRecords,
    };

    setTimeout(() => {
      executeBatchCommit(newBatch);
      MOCK_BULK_BATCHES.unshift(newBatch);
      router.push(`/referrals/batches/${batchId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <main className="mx-auto flex w-full max-w-[1105px] flex-col gap-6 px-6 font-['Clash_Grotesk'] text-[#101828]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eaecf0] pb-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#667085] mb-1">
              <Link href="/referrals" className="hover:text-[#007aff]">Cases &amp; Referrals</Link>
              <span>/</span>
              <span>Bulk Intake Engine</span>
            </div>
            <h1 className="text-[32px] font-[500] leading-tight text-[#101828]">
              Bulk Referral Intake &amp; Ingestion
            </h1>
          </div>
          <Link href="/referrals" className="text-[14px] text-[#667085] hover:text-[#101828]">
            &larr; Exit to Directory
          </Link>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 text-center text-[13px]">
          <div
            className={`rounded-md border p-2.5 transition-colors ${
              step === "upload"
                ? "border-[#007aff] bg-white font-medium text-[#007aff] shadow-2xs"
                : "border-[#eaecf0] bg-white/70 text-[#667085]"
            }`}
          >
            1. Source Selection &amp; Files
          </div>
          <div
            className={`rounded-md border p-2.5 transition-colors ${
              step === "mapping"
                ? "border-[#007aff] bg-white font-medium text-[#007aff] shadow-2xs"
                : "border-[#eaecf0] bg-white/70 text-[#667085]"
            }`}
          >
            2. Field Column Mapping
          </div>
          <div
            className={`rounded-md border p-2.5 transition-colors ${
              step === "preview" || step === "importing"
                ? "border-[#007aff] bg-white font-medium text-[#007aff] shadow-2xs"
                : "border-[#eaecf0] bg-white/70 text-[#667085]"
            }`}
          >
            3. Validation Preview &amp; Import
          </div>
        </div>

        {/* Step 1: Upload Container */}
        {step === "upload" && (
          <div className="rounded-[8px] border border-[#eaecf0] bg-white p-6 shadow-xs flex flex-col gap-6">
            <div>
              <label className="text-[13px] font-medium text-[#344054] block mb-2.5">
                Bulk Ingestion Mode
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Option 1: Spreadsheet */}
                <button
                  type="button"
                  onClick={() => setImportMethod("spreadsheet")}
                  className={`group relative rounded-[8px] border p-4 text-left transition-all ${
                    importMethod === "spreadsheet"
                      ? "border-[#007aff] bg-white ring-2 ring-[#007aff]/15 shadow-xs"
                      : "border-[#eaecf0] bg-white hover:border-[#d0d5dd] hover:bg-[#f8fafc]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[15px] font-[500] leading-snug ${
                        importMethod === "spreadsheet" ? "text-[#007aff]" : "text-[#101828]"
                      }`}
                    >
                      Spreadsheet-Based Bulk Import
                    </span>
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        importMethod === "spreadsheet"
                          ? "border-[#007aff] bg-[#007aff]"
                          : "border-[#d0d5dd] bg-white"
                      }`}
                    >
                      {importMethod === "spreadsheet" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#475467]">
                    Upload XLSX or CSV rosters from Keystone, UPMC, or health plan care connectors.
                  </p>
                </button>

                {/* Option 2: Documents */}
                <button
                  type="button"
                  onClick={() => setImportMethod("documents")}
                  className={`group relative rounded-[8px] border p-4 text-left transition-all ${
                    importMethod === "documents"
                      ? "border-[#007aff] bg-white ring-2 ring-[#007aff]/15 shadow-xs"
                      : "border-[#eaecf0] bg-white hover:border-[#d0d5dd] hover:bg-[#f8fafc]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[15px] font-[500] leading-snug ${
                        importMethod === "documents" ? "text-[#007aff]" : "text-[#101828]"
                      }`}
                    >
                      Multiple Document Batch Upload
                    </span>
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        importMethod === "documents"
                          ? "border-[#007aff] bg-[#007aff]"
                          : "border-[#d0d5dd] bg-white"
                      }`}
                    >
                      {importMethod === "documents" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#475467]">
                    Upload a batch of independent PDF/scanned fax referrals simultaneously.
                  </p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#344054]">
                  Referral Source / Channel
                </label>
                <input
                  type="text"
                  required
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  className="mt-1 w-full rounded-[6px] border border-[#eaecf0] bg-white p-2.5 text-[14px] text-[#101828] focus:border-[#007aff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#344054]">
                  {importMethod === "spreadsheet"
                    ? "Select Spreadsheet (.xlsx, .csv)"
                    : "Select Multiple Files (.pdf, .tiff)"}
                </label>
                <input
                  type="file"
                  multiple={importMethod === "documents"}
                  accept={importMethod === "spreadsheet" ? ".csv,.xlsx,.xls" : ".pdf,.png,.tiff"}
                  onChange={handleFilesSelected}
                  className="mt-1 w-full rounded-[6px] border border-[#eaecf0] bg-white p-2 text-[12px] text-[#344054] file:mr-3 file:rounded file:border-0 file:bg-[#007aff]/10 file:px-2.5 file:py-1 file:text-[12px] file:font-medium file:text-[#007aff]"
                />
              </div>
            </div>

            {files.length > 0 && (
              <div className="rounded-[6px] border border-[#eaecf0] bg-[#f8fafc] p-3 text-[12px]">
                <strong className="text-[#101828] block mb-1">
                  Files staged for processing ({files.length}):
                </strong>
                <ul className="list-disc ml-5 text-[#667085]">
                  {files.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-[#eaecf0] pt-4 flex justify-end">
              <button
                type="button"
                onClick={processUploadToNextStep}
                className="inline-flex items-center gap-2 rounded-[8px] border border-[#eaecf0] bg-white px-4 py-2.5 text-[14px] font-[500] text-[#344054] shadow-xs hover:bg-[#f8fafc] transition-colors"
              >
                <span>Proceed to {importMethod === "spreadsheet" ? "Column Mapping" : "Validation Preview"}</span>
                <span className="text-[#007aff] font-semibold">&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Spreadsheet Column Mapping */}
        {step === "mapping" && (
          <div className="rounded-[8px] border border-[#eaecf0] bg-white p-6 shadow-xs flex flex-col gap-5">
            <div>
              <h2 className="text-[18px] font-[500] text-[#101828]">Map Incoming Spreadsheet Columns</h2>
              <p className="text-[12px] text-[#667085]">
                Match the detected column headers from your file with the required Case Profile schema.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
              <div>
                <label className="block text-[12px] font-medium text-[#344054]">Patient Full Name *</label>
                <select
                  value={mapping.patientName || ""}
                  onChange={(e) => setMapping({ ...mapping, patientName: e.target.value })}
                  className="mt-1 w-full rounded-[6px] border border-[#eaecf0] p-2 text-[14px] text-[#101828] bg-white focus:outline-none focus:border-[#007aff]"
                >
                  {detectedHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#344054]">Date of Birth *</label>
                <select
                  value={mapping.dob || ""}
                  onChange={(e) => setMapping({ ...mapping, dob: e.target.value })}
                  className="mt-1 w-full rounded-[6px] border border-[#eaecf0] p-2 text-[14px] text-[#101828] bg-white focus:outline-none focus:border-[#007aff]"
                >
                  {detectedHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#344054]">Patient Postal ZIP Code *</label>
                <select
                  value={mapping.zipCode || ""}
                  onChange={(e) => setMapping({ ...mapping, zipCode: e.target.value })}
                  className="mt-1 w-full rounded-[6px] border border-[#eaecf0] p-2 text-[14px] text-[#101828] bg-white focus:outline-none focus:border-[#007aff]"
                >
                  {detectedHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#344054]">Care Discipline Required *</label>
                <select
                  value={mapping.careDiscipline || ""}
                  onChange={(e) => setMapping({ ...mapping, careDiscipline: e.target.value })}
                  className="mt-1 w-full rounded-[6px] border border-[#eaecf0] p-2 text-[14px] text-[#101828] bg-white focus:outline-none focus:border-[#007aff]"
                >
                  {detectedHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#344054]">Authorized Hours / Wk</label>
                <select
                  value={mapping.authorizedHours || ""}
                  onChange={(e) => setMapping({ ...mapping, authorizedHours: e.target.value })}
                  className="mt-1 w-full rounded-[6px] border border-[#eaecf0] p-2 text-[14px] text-[#101828] bg-white focus:outline-none focus:border-[#007aff]"
                >
                  {detectedHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#344054]">Clinical Directives / Summary</label>
                <select
                  value={mapping.clinicalNotes || ""}
                  onChange={(e) => setMapping({ ...mapping, clinicalNotes: e.target.value })}
                  className="mt-1 w-full rounded-[6px] border border-[#eaecf0] p-2 text-[14px] text-[#101828] bg-white focus:outline-none focus:border-[#007aff]"
                >
                  {detectedHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-[#eaecf0] pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="rounded-[6px] border border-[#eaecf0] px-4 py-2 text-[14px] text-[#344054] hover:bg-[#f8fafc]"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={generateSpreadsheetStagedRecords}
                className="inline-flex items-center gap-2 rounded-[8px] border border-[#eaecf0] bg-white px-4 py-2.5 text-[14px] font-[500] text-[#344054] shadow-xs hover:bg-[#f8fafc] transition-colors"
              >
                <span>Validate &amp; Preview Rows</span>
                <span className="text-[#007aff] font-semibold">&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Pre-Import Preview & Validation Report */}
        {(step === "preview" || step === "importing") && (
          <div className="rounded-[8px] border border-[#eaecf0] bg-white p-6 shadow-xs flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#eaecf0] pb-4">
              <div>
                <h2 className="text-[18px] font-[500] text-[#101828]">Batch Validation Report</h2>
                <p className="text-[12px] text-[#667085]">
                  Review parsed rows before committing. Excluded or invalid rows will not generate referral cases.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#34c759] font-medium bg-[#34c759]/10 px-2.5 py-1 rounded">
                  {stagedRecords.filter((r) => r.isValid && !r.isExcluded).length} Ready
                </span>
                <span className="text-[12px] text-[#ff9500] font-medium bg-[#ff9500]/10 px-2.5 py-1 rounded">
                  {stagedRecords.filter((r) => r.isPotentialDuplicate && !r.isExcluded).length} Duplicates
                </span>
                <span className="text-[12px] text-[#ef4444] font-medium bg-[#ef4444]/10 px-2.5 py-1 rounded">
                  {stagedRecords.filter((r) => !r.isValid || r.isExcluded).length} Excluded / Invalid
                </span>
              </div>
            </div>

            {/* Staged Records Table */}
            <div className="overflow-x-auto rounded-[6px] border border-[#eaecf0]">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-[#eaecf0] bg-[#f8fafc] text-[12px] text-[#667085]">
                    <th className="py-2.5 px-3">Include?</th>
                    <th className="py-2.5 px-3">Ref/Row</th>
                    <th className="py-2.5 px-3">Patient Name</th>
                    <th className="py-2.5 px-3">DOB</th>
                    <th className="py-2.5 px-3">Discipline</th>
                    <th className="py-2.5 px-3">ZIP</th>
                    <th className="py-2.5 px-3">Status / Diagnostics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaecf0]">
                  {stagedRecords.map((r, idx) => {
                    const recordKey = r.tempId || r.id || `row-${idx}`;
                    return (
                      <tr
                        key={recordKey}
                        className={r.isExcluded ? "bg-[#f8fafc]/80 opacity-60" : "hover:bg-[#f8fafc]"}
                      >
                        <td className="py-2.5 px-3">
                          <input
                            type="checkbox"
                            checked={!r.isExcluded}
                            onChange={() => toggleExcludeRecord(recordKey)}
                            className="rounded border-[#eaecf0] text-[#007aff]"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#667085]">
                          #{r.rowNumber ?? idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#101828]">
                          {r.parsedFields?.patientName || r.mappedPatientName || (
                            <span className="text-[#ef4444] italic">Empty</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[#667085]">
                          {r.parsedFields?.dob || r.mappedDob || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-[#344054]">
                          {r.parsedFields?.careDiscipline || r.mappedDiscipline || "—"}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[12px]">
                          {(r.parsedFields?.zipCode || r.mappedZip) ? (
                            r.parsedFields?.zipCode || r.mappedZip
                          ) : (
                            <span className="text-[#ef4444]">Missing</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {r.isPotentialDuplicate && (
                            <span className="inline-flex rounded-full bg-[#ff9500]/15 px-2 py-0.5 text-[11px] font-medium text-[#ff9500] mr-1">
                              Duplicate ({r.duplicateMatchId || "Flagged"})
                            </span>
                          )}
                          {!r.isValid ? (
                            <span className="inline-flex rounded-full bg-[#ef4444]/15 px-2 py-0.5 text-[11px] font-medium text-[#ef4444]">
                              {r.validationErrors?.[0] || "Invalid Format"}
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-[#34c759]/15 px-2 py-0.5 text-[11px] font-medium text-[#34c759]">
                              Valid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#eaecf0] pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(importMethod === "spreadsheet" ? "mapping" : "upload")}
                className="rounded-[6px] border border-[#eaecf0] px-4 py-2 text-[14px] text-[#344054] hover:bg-[#f8fafc]"
              >
                &larr; Back
              </button>

              <button
                type="button"
                disabled={step === "importing"}
                onClick={handleConfirmImport}
                className="inline-flex items-center gap-2 rounded-[8px] border border-[#eaecf0] bg-white px-4 py-2.5 text-[14px] font-[500] text-[#344054] shadow-xs hover:bg-[#f8fafc] disabled:opacity-50 transition-colors"
              >
                <span>
                  {step === "importing"
                    ? "Importing Records..."
                    : `Confirm & Ingest ${
                        stagedRecords.filter((r) => r.isValid && !r.isExcluded).length
                      } Referrals`}
                </span>
                <span className="text-[#007aff] font-semibold">&rarr;</span>
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}