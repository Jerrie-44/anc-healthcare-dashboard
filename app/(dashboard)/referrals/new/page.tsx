// app/(dashboard)/referrals/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_CASES_DB } from "@/lib/referral-service";
import { CaseRecord, computeDerivedStatus, CareScheduleRequirements } from "@/types/referral";

type IntakeTab = "document" | "email" | "spreadsheet";

export default function NewReferralIntakePage() {
  const router = useRouter();
  const [tab, setTab] = useState<IntakeTab>("document");
  const [referralSource, setReferralSource] = useState("St. Jude Vascular Care");
  const [dateReceived, setDateReceived] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [internalNotes, setInternalNotes] = useState("");
  const [emailText, setEmailText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Duplicate Check Modal State
  const [isProcessing, setIsProcessing] = useState(false);
  const [potentialDuplicateCase, setPotentialDuplicateCase] =
    useState<CaseRecord | null>(null);

  const handleSubmitIntake = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const generatedId = `REF-${Math.floor(4000 + Math.random() * 900)}`;

    const hasNameMatch =
      emailText.toLowerCase().includes("elena") ||
      (uploadedFileName && uploadedFileName.toLowerCase().includes("rostova"));

    setTimeout(() => {
      setIsProcessing(false);
      if (hasNameMatch) {
        const existing = MOCK_CASES_DB[0];
        setPotentialDuplicateCase(existing);
      } else {
        commitCaseCreation(generatedId, "Clear");
      }
    }, 1200);
  };

  const commitCaseCreation = (
    caseId: string,
    duplicateResolution: "Clear" | "Potential Duplicate"
  ) => {
    const defaultSchedule: CareScheduleRequirements = {
      startDate: { value: "", state: "missing" },
      requiredDays: { value: [], state: "missing" },
      timeWindows: { value: [], state: "missing" },
      hoursPerWeek: { value: 14, state: "ai-extracted" },
      recurringType: { value: "Recurring Weekly", state: "missing" },
      careTimeZone: { value: "America/New_York (ET)", state: "ai-extracted" },
      schedulingConstraints: { value: "", state: "missing" },
      sourceDocumentRef: uploadedFileName || "Direct Intake",
    };

    const newCase: CaseRecord = {
      id: caseId,
      referralSource,
      dateReceived,
      intakeMethod: tab,
      internalNotes,
      uploadedBy: "Dr. R. Sterling (Operator)",
      intakeStatus: "Received",
      duplicateStatus: duplicateResolution,
      extractionStatus: "Completed",
      validationStatus: "Awaiting Validation",
      matchingStatus: "Not Started",
      humanReviewStatus: "Awaiting Review",
      schedulingStatus: "Incomplete",
      validatedProfileVersion: 0,
      validatedProfileHistory: [],
      sourceDocuments: [
        {
          id: `doc-${Date.now()}`,
          name:
            uploadedFileName ||
            (tab === "email"
              ? "intake_paste.txt"
              : "spreadsheet_intake.xlsx"),
          fileName:
            uploadedFileName ||
            (tab === "email"
              ? "intake_paste.txt"
              : "spreadsheet_intake.xlsx"),
          type:
            tab === "email"
              ? "email"
              : tab === "spreadsheet"
              ? "spreadsheet"
              : "pdf",
          fileType:
            tab === "email"
              ? "Email Intake"
              : tab === "spreadsheet"
              ? "Spreadsheet / Care Connector"
              : "Hospital Discharge PDF",
          uploadedAt: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 16),
          uploadedBy: "Dr. R. Sterling",
          rawContent:
            emailText ||
            "Patient: Arthur Vance\nDOB: 1980-04-12\nCondition: Post-Surgical Vacuum Dressing\nDiscipline: RN-WCC\nHours: 14 hrs/wk\nZIP: 15213",
          rawTextPreview:
            emailText ||
            "Patient: Arthur Vance\nDOB: 1980-04-12\nCondition: Post-Surgical Vacuum Dressing\nDiscipline: RN-WCC\nHours: 14 hrs/wk\nZIP: 15213",
        },
      ],
      draftProfile: {
        patientName: { value: "Arthur Vance", state: "ai-extracted" },
        dob: { value: "1980-04-12", state: "ai-extracted" },
        dateOfBirth: { value: "1980-04-12", state: "ai-extracted" },
        age: { value: 46, state: "ai-extracted" },
        zipCode: { value: "15213", state: "ai-extracted" },
        primaryCondition: {
          value: "Post-Surgical Vacuum Dressing",
          state: "ai-extracted",
        },
        careDisciplineRequired: {
          value: "Wound Care Certified Nurse (RN-WCC)",
          state: "ai-extracted",
        },
        authorizedHoursPerWeek: { value: 14, state: "ai-extracted" },
        shiftPreference: { value: "Morning Visits", state: "ai-extracted" },
        clinicalNotesSummary: {
          value: "Wound VAC inspection and drain sanitization required.",
          state: "ai-extracted",
        },
        missingRequiredFields: [],
        schedule: defaultSchedule,
      },
      recommendations: [],
      activityLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 16),
          actor: "Dr. R. Sterling",
          action: "Referral Intake Created",
          details: `Source: ${referralSource} via ${tab} intake. Duplicate review: ${duplicateResolution}`,
        },
      ],
    };

    MOCK_CASES_DB.unshift(newCase);
    router.push(`/referrals/${caseId}/validate`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10 font-['Clash_Grotesk'] text-[#101828]">
        {/* Header Block Aligned with Standard ANC Page Layout */}
        <div className="flex flex-col justify-between gap-4 py-1 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[36px] font-[500] leading-tight text-[#101828]">
              New Referral Intake
            </h1>
            <p className="mt-1 text-[14px] text-[#667085]">
              Upload referral documentation or paste intake content for NLP extraction and duplicate screening.
            </p>
          </div>

          <Link
            href="/referrals"
            className="inline-flex items-center gap-2 rounded-[8px] border border-[#eaecf0] bg-white px-3.5 py-2.5 text-[14px] font-[500] text-[#344054] shadow-xs hover:bg-[#f8fafc] transition-colors shrink-0"
          >
            &larr; Back to Directory
          </Link>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmitIntake}
          className="rounded-[8px] border border-[#eaecf0] bg-white p-6 lg:p-8 shadow-xs flex flex-col gap-6"
        >
          {/* Method Selection as Secondary Filter/Tab Buttons */}
          <div>
            <label className="text-[13px] font-medium text-[#344054] block mb-2.5">
              Select Ingestion Method
            </label>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setTab("document")}
                className={`inline-flex items-center gap-2 rounded-[8px] border px-3.5 py-2 text-[14px] font-[500] transition-colors ${
                  tab === "document"
                    ? "border-[#007aff] bg-white text-[#007aff] ring-1 ring-[#007aff] shadow-2xs"
                    : "border-[#eaecf0] bg-white text-[#344054] hover:bg-[#f8fafc]"
                }`}
              >
                Document Upload (PDF/Fax)
              </button>

              <button
                type="button"
                onClick={() => setTab("email")}
                className={`inline-flex items-center gap-2 rounded-[8px] border px-3.5 py-2 text-[14px] font-[500] transition-colors ${
                  tab === "email"
                    ? "border-[#007aff] bg-white text-[#007aff] ring-1 ring-[#007aff] shadow-2xs"
                    : "border-[#eaecf0] bg-white text-[#344054] hover:bg-[#f8fafc]"
                }`}
              >
                Email Body Text
              </button>

              <button
                type="button"
                onClick={() => setTab("spreadsheet")}
                className={`inline-flex items-center gap-2 rounded-[8px] border px-3.5 py-2 text-[14px] font-[500] transition-colors ${
                  tab === "spreadsheet"
                    ? "border-[#007aff] bg-white text-[#007aff] ring-1 ring-[#007aff] shadow-2xs"
                    : "border-[#eaecf0] bg-white text-[#344054] hover:bg-[#f8fafc]"
                }`}
              >
                Spreadsheet Import (Care Connectors)
              </button>
            </div>
          </div>

          {/* Ingestion Dropzone / Input Area */}
          {tab === "document" && (
            <div className="rounded-[8px] border-2 border-dashed border-[#eaecf0] bg-[#f8fafc]/60 p-8 text-center hover:border-[#007aff] transition-colors cursor-pointer">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.tiff"
                onChange={(e) =>
                  setUploadedFileName(e.target.files?.[0]?.name || null)
                }
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <span className="text-[14px] font-medium text-[#007aff] block">
                  Click to upload referral document
                </span>
                <span className="text-[12px] text-[#667085] block mt-1">
                  Accepts PDF, TIFF, scanned medical records
                </span>
                {uploadedFileName && (
                  <span className="mt-2.5 inline-block rounded-md bg-[#34c759]/10 px-2.5 py-1 font-mono text-[12px] font-medium text-[#34c759]">
                    Selected: {uploadedFileName}
                  </span>
                )}
              </label>
            </div>
          )}

          {tab === "email" && (
            <div>
              <label className="text-[12px] font-medium text-[#344054] block mb-1">
                Paste Raw Email Body
              </label>
              <textarea
                rows={6}
                required
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Paste incoming clinical referral email message text here..."
                className="w-full rounded-[6px] border border-[#eaecf0] bg-white p-3 text-[14px] text-[#101828] focus:border-[#007aff] focus:outline-none"
              />
            </div>
          )}

          {tab === "spreadsheet" && (
            <div className="rounded-[8px] border-2 border-dashed border-[#eaecf0] bg-[#f8fafc]/60 p-8 text-center hover:border-[#007aff] transition-colors cursor-pointer">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) =>
                  setUploadedFileName(e.target.files?.[0]?.name || null)
                }
                className="hidden"
                id="sheet-upload"
              />
              <label htmlFor="sheet-upload" className="cursor-pointer block">
                <span className="text-[14px] font-medium text-[#007aff] block">
                  Click to select Care Connector spreadsheet
                </span>
                <span className="text-[12px] text-[#667085] block mt-1">
                  Accepts Keystone, UPMC, or standard CSV rosters
                </span>
                {uploadedFileName && (
                  <span className="mt-2.5 inline-block rounded-md bg-[#34c759]/10 px-2.5 py-1 font-mono text-[12px] font-medium text-[#34c759]">
                    Selected: {uploadedFileName}
                  </span>
                )}
              </label>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#344054]">
                Referral Source
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
                Date Received
              </label>
              <input
                type="date"
                required
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                className="mt-1 w-full rounded-[6px] border border-[#eaecf0] bg-white p-2.5 text-[14px] text-[#101828] focus:border-[#007aff] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#344054]">
              Internal Intake Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Urgent post-operative intake from surgical hotline."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="mt-1 w-full rounded-[6px] border border-[#eaecf0] bg-white p-2.5 text-[14px] text-[#101828] focus:border-[#007aff] focus:outline-none"
            />
          </div>

          {/* Bottom Action Footer */}
          <div className="border-t border-[#eaecf0] pt-5 flex justify-end">
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center justify-center rounded-[8px] bg-[#007aff] px-6 py-2.5 text-[14px] font-[500] text-white shadow-xs hover:bg-[#0066cc] disabled:bg-[#eaecf0] disabled:text-[#667085] transition-colors"
            >
              {isProcessing
                ? "Processing & Duplicate Screening..."
                : "Process Referral & Extract \u2192"}
            </button>
          </div>
        </form>

        {/* Duplicate Review Dialog */}
        {potentialDuplicateCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-[8px] border border-[#eaecf0] bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2 text-[#ff9500] font-medium text-[16px] mb-2">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.334.192 3 1.732 3z"
                  />
                </svg>
                Potential Duplicate Referral Detected
              </div>

              <p className="text-[14px] text-[#344054] leading-relaxed">
                The intake matches existing case{" "}
                <strong className="font-mono">{potentialDuplicateCase.id}</strong>{" "}
                (Patient:{" "}
                <strong>
                  {potentialDuplicateCase.draftProfile.patientName.value}
                </strong>
                , DOB: {potentialDuplicateCase.draftProfile.dob?.value || potentialDuplicateCase.draftProfile.dateOfBirth?.value || "N/A"}).
              </p>

              <div className="my-4 rounded-[6px] border border-[#eaecf0] bg-[#f8fafc] p-3 text-[12px] text-[#667085]">
                Original Case Status:{" "}
                <span className="font-semibold text-[#101828]">
                  {computeDerivedStatus(potentialDuplicateCase)}
                </span>{" "}
                &bull; Source: {potentialDuplicateCase.referralSource}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    potentialDuplicateCase.sourceDocuments.push({
                      id: `doc-${Date.now()}`,
                      name: uploadedFileName || "supplemental_referral.pdf",
                      fileName: uploadedFileName || "supplemental_referral.pdf",
                      type: "pdf",
                      fileType: "Hospital Discharge PDF",
                      uploadedAt: new Date()
                        .toISOString()
                        .replace("T", " ")
                        .substring(0, 16),
                      uploadedBy: "Dr. R. Sterling",
                      rawContent:
                        emailText ||
                        "Supplemental attachment linked via duplicate resolution.",
                      rawTextPreview:
                        emailText ||
                        "Supplemental attachment linked via duplicate resolution.",
                    });
                    potentialDuplicateCase.activityLogs.push({
                      id: `log-${Date.now()}`,
                      timestamp: new Date()
                        .toISOString()
                        .replace("T", " ")
                        .substring(0, 16),
                      actor: "Dr. R. Sterling",
                      action: "Duplicate Linked",
                      details:
                        "Incoming referral confirmed as belonging to this existing case; document appended.",
                    });
                    router.push(`/referrals/${potentialDuplicateCase.id}`);
                  }}
                  className="rounded-[6px] border border-[#eaecf0] bg-white py-2 text-[14px] font-medium text-[#344054] hover:bg-[#f8fafc] transition-colors"
                >
                  1. Link to Existing Case (Attach Document)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    commitCaseCreation(
                      `REF-${Math.floor(4000 + Math.random() * 900)}`,
                      "Clear"
                    );
                  }}
                  className="rounded-[6px] border border-[#eaecf0] bg-white py-2 text-[14px] font-medium text-[#344054] hover:bg-[#f8fafc] transition-colors"
                >
                  2. Continue as New Independent Case
                </button>

                <button
                  type="button"
                  onClick={() => {
                    commitCaseCreation(
                      `REF-${Math.floor(4000 + Math.random() * 900)}`,
                      "Potential Duplicate"
                    );
                  }}
                  className="rounded-[6px] border border-[#eaecf0] bg-white py-2 text-[14px] font-medium text-[#344054] hover:bg-[#f8fafc] transition-colors"
                >
                  3. Flag &amp; Review Later
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}