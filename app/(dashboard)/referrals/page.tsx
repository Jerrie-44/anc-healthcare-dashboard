// app/(dashboard)/referrals/page.tsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { MOCK_REFERRALS, Referral } from "@/types/referral";
import { MOCK_CLINICIANS, Clinician } from "@/types/clinician";
import {
  TriageBadge,
  PriorityBadge,
  ExtractionBadge,
} from "@/components/application/referrals/referral-badges";

interface ExtendedReferral extends Referral {
  isNewlyUploaded?: boolean;
  missingFields?: string[];
}

export default function ReferralsDirectoryPage() {
  const [referrals, setReferrals] = useState<ExtendedReferral[]>(MOCK_REFERRALS);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Ingestion Modal & Status States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Animated Intake Metric Summary
  const [uploadSummary, setUploadSummary] = useState<{
    totalUploaded: number;
    verifiedCount: number;
    missingCount: number;
    allocatedCount: number;
  } | null>(null);

  // Animated number counters for the summary notification
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedVerified, setAnimatedVerified] = useState(0);
  const [animatedMissing, setAnimatedMissing] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Number counting animation effect
  useEffect(() => {
    if (!uploadSummary) {
      setAnimatedTotal(0);
      setAnimatedVerified(0);
      setAnimatedMissing(0);
      return;
    }

    const duration = 1000;
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      setAnimatedTotal(Math.floor(progress * uploadSummary.totalUploaded));
      setAnimatedVerified(Math.floor(progress * uploadSummary.verifiedCount));
      setAnimatedMissing(Math.floor(progress * uploadSummary.missingCount));

      if (step >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [uploadSummary]);

  // Filtered referrals list
  const filteredReferrals = useMemo(() => {
    return referrals.filter((r) => {
      const matchesSearch =
        r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.primaryCondition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.referringProvider.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStage = stageFilter === "All" || r.triageStage === stageFilter;
      const matchesPriority = priorityFilter === "All" || r.priority === priorityFilter;

      return matchesSearch && matchesStage && matchesPriority;
    });
  }, [referrals, searchQuery, stageFilter, priorityFilter]);

  // Download Sample CSV helper
  const handleDownloadTemplate = () => {
    const csvContent =
      "Patient Name,DOB,Primary Condition,Priority,Referring Provider\r\n" +
      "Elena Rostova,1964-07-22,Venous Stasis Ulcer Treatment,Urgent,St. Jude Vascular Care\r\n" +
      "Arthur Vance,,Post-Operative Wound Care & Dressing,Standard,Metropolitan Surgical Group\r\n" +
      "Clara Oswin,1978-02-14,,High,Pine Valley Rehab\r\n" +
      "Marcus Vance,1985-05-19,Neuropathic Foot Ulcer Vacuum Therapy,Urgent,General Health Clinic";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "anc_bulk_referral_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Clinical Allocation Engine
  const allocateClinician = (condition: string): Clinician | null => {
    if (!condition) return null;
    const condLower = condition.toLowerCase();

    let targetDiscipline = "Registered Nurse (RN)";
    if (condLower.includes("ulcer") || condLower.includes("wound") || condLower.includes("injury")) {
      targetDiscipline = "Wound Care";
    } else if (condLower.includes("rehab") || condLower.includes("therapy") || condLower.includes("mobility")) {
      targetDiscipline = "Physical Therapist";
    }

    const candidates = MOCK_CLINICIANS.filter(
      (c) =>
        c.discipline.toLowerCase().includes(targetDiscipline.toLowerCase()) &&
        c.activeCaseload < c.maxCaseload
    );

    if (candidates.length > 0) {
      return candidates.sort((a, b) => a.activeCaseload - b.activeCaseload)[0];
    }

    const fallback = MOCK_CLINICIANS.filter((c) => c.activeCaseload < c.maxCaseload);
    return fallback.length > 0 ? fallback[0] : null;
  };

  // Process File Upload and Ingest Cases
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);

      const startIdx = lines[0].toLowerCase().includes("patient") ? 1 : 0;
      const parsedNewReferrals: ExtendedReferral[] = [];
      let verifiedCount = 0;
      let missingCount = 0;
      let allocatedCount = 0;

      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.every((c) => c === "")) continue;

        const patientName = cols[0] || "";
        const dob = cols[1] || "";
        const primaryCondition = cols[2] || "";
        const priorityInput = cols[3] || "Standard";
        const referringProvider = cols[4] || "";

        // Detect missing essential fields
        const missingFields: string[] = [];
        if (!patientName) missingFields.push("Name");
        if (!dob) missingFields.push("DOB");
        if (!primaryCondition) missingFields.push("Condition");
        if (!referringProvider) missingFields.push("Provider");

        const isVerified = missingFields.length === 0;
        if (isVerified) {
          verifiedCount++;
        } else {
          missingCount++;
        }

        const validPriority: Referral["priority"] =
          priorityInput === "Urgent" || priorityInput === "High" ? priorityInput : "Standard";

        const assignedNurse = allocateClinician(primaryCondition);
        const caseNumber = Math.floor(1000 + Math.random() * 9000);

        parsedNewReferrals.push({
          id: `REF-${caseNumber}`,
          patientName: patientName || `Unregistered Intake #${caseNumber}`,
          dob: dob || "N/A",
          primaryCondition: primaryCondition || "Pending Clinical Diagnostic Spec",
          priority: validPriority,
          triageStage: !isVerified
            ? "Pending Review"
            : assignedNurse
            ? "Matched"
            : "Ready for Matching",
          extractionStatus: isVerified ? "Extracted" : "Needs Review",
          referringProvider: assignedNurse
            ? `${referringProvider || "Direct Ingest"} (Assigned: ${assignedNurse.name})`
            : referringProvider || "Direct Ingest",
          receivedDate: new Date().toISOString().split("T")[0],
          isNewlyUploaded: true,
          missingFields,
        });

        if (assignedNurse && isVerified) allocatedCount++;
      }

      setReferrals((prev) => [...parsedNewReferrals, ...prev]);
      setIsProcessing(false);
      setIsUploadOpen(false);

      setUploadSummary({
        totalUploaded: parsedNewReferrals.length,
        verifiedCount,
        missingCount,
        allocatedCount,
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8fafc] p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 py-2 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-display-4-medium tracking-tight text-text-primary">
              Referrals Directory
            </h1>
            <p className="mt-1 text-body-2-regular text-text-secondary">
              Central triage pipeline, automatic nurse allocation, and intake validation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#007aff] px-4 py-2.5 text-body-2-medium font-medium text-white shadow-xs transition hover:bg-[#0062cc]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Bulk Upload Cases
            </button>
          </div>
        </div>

        {/* Animated Validation & Allocation Banner */}
        {uploadSummary && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden rounded-[12px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#007aff]">
                  <svg className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-body-medium font-semibold text-text-primary">
                    Intake Ingestion &amp; Validation Complete
                  </h4>
                  <p className="text-caption-1-regular text-text-secondary">
                    Review newly processed rows highlighted in the table below.
                  </p>
                </div>
              </div>

              {/* Counter Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Total */}
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                  <span className="font-mono text-body-2-bold font-bold text-slate-900">
                    {animatedTotal}
                  </span>
                  <span className="text-caption-2-medium text-slate-500 uppercase tracking-wide">
                    Found
                  </span>
                </div>

                {/* Verified */}
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-mono text-body-2-bold font-bold">
                    {animatedVerified}
                  </span>
                  <span className="text-caption-2-medium uppercase tracking-wide">
                    Verified
                  </span>
                </div>

                {/* Incomplete / Missing */}
                {uploadSummary.missingCount > 0 && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-800">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="font-mono text-body-2-bold font-bold">
                      {animatedMissing}
                    </span>
                    <span className="text-caption-2-medium uppercase tracking-wide">
                      Missing Data
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setUploadSummary(null)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                  aria-label="Dismiss banner"
                >
                  &#x2715;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col gap-3 rounded-[10px] border border-[#eaecf0] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by patient, ID, provider, condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[8px] border border-[#d0d5dd] bg-white px-3.5 py-2 pl-9 text-body-2-regular text-text-primary focus:border-[#007aff] focus:outline-none"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="rounded-[8px] border border-[#d0d5dd] bg-white px-3 py-2 text-caption-1-medium text-text-secondary focus:border-[#007aff] focus:outline-none"
            >
              <option value="All">All Stages</option>
              <option value="Ready for Matching">Ready for Matching</option>
              <option value="Matched">Matched</option>
              <option value="Pending Review">Pending Review</option>
              <option value="On Hold">On Hold</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-[8px] border border-[#d0d5dd] bg-white px-3 py-2 text-caption-1-medium text-text-secondary focus:border-[#007aff] focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="overflow-hidden rounded-[10px] border border-[#eaecf0] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#eaecf0] bg-slate-50/75 text-caption-1-medium text-text-secondary">
                  <th className="py-3 px-4 font-semibold">Patient &amp; ID</th>
                  <th className="py-3 px-4 font-semibold">Condition</th>
                  <th className="py-3 px-4 font-semibold">Data Quality</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Triage Stage</th>
                  <th className="py-3 px-4 font-semibold">Allocation &amp; Source</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecf0] text-body-2-regular">
                {filteredReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-text-tertiary">
                      No referrals found matching the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredReferrals.map((referral) => {
                    const hasMissing =
                      referral.missingFields && referral.missingFields.length > 0;

                    // Row highlight classes for recently uploaded items
                    let rowHighlight = "hover:bg-slate-50/60";
                    if (referral.isNewlyUploaded) {
                      rowHighlight = hasMissing
                        ? "bg-amber-50/40 border-l-4 border-l-amber-500 animate-in fade-in"
                        : "bg-emerald-50/30 border-l-4 border-l-emerald-500 animate-in fade-in";
                    }

                    return (
                      <tr key={referral.id} className={`transition duration-300 ${rowHighlight}`}>
                        {/* Patient & ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/referrals/${referral.id}`}
                              className="font-medium text-text-primary hover:text-[#007aff] transition"
                            >
                              {referral.patientName}
                            </Link>
                            {referral.isNewlyUploaded && (
                              <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-[#007aff]">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-caption-2-regular text-text-tertiary">
                            {referral.id} &bull; DOB: {referral.dob}
                          </div>
                        </td>

                        {/* Condition */}
                        <td className="py-3.5 px-4 text-text-secondary max-w-[240px] truncate">
                          {referral.primaryCondition}
                        </td>

                        {/* Data Quality & Missing Detection Pill */}
                        <td className="py-3.5 px-4">
                          {hasMissing ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                              <svg className="h-3 w-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Missing: {referral.missingFields?.join(", ")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                              <svg className="h-3 w-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Verified Complete
                            </span>
                          )}
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4">
                          <PriorityBadge priority={referral.priority} />
                        </td>

                        {/* Triage Stage */}
                        <td className="py-3.5 px-4">
                          <TriageBadge stage={referral.triageStage} />
                        </td>

                        {/* Allocation / Source */}
                        <td className="py-3.5 px-4 text-text-secondary text-caption-1-regular max-w-[220px] truncate">
                          {referral.referringProvider}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={
                              referral.triageStage === "Matched"
                                ? `/referrals/${referral.id}`
                                : `/referrals/${referral.id}/match`
                            }
                            className="rounded-[6px] border border-[#d0d5dd] bg-white px-2.5 py-1 text-caption-1-medium text-text-secondary hover:bg-slate-50 transition"
                          >
                            {referral.triageStage === "Matched" ? "View Case \u2192" : "Allocate Nurse \u2192"}
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Intake Upload Modal */}
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="flex w-full max-w-lg flex-col gap-5 rounded-[12px] border border-[#eaecf0] bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-[#eaecf0] pb-3">
                <h3 className="text-body-medium font-semibold text-text-primary">
                  Bulk Upload &amp; Quality Scan
                </h3>
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  &#x2715;
                </button>
              </div>

              <div className="flex flex-col gap-2 text-body-2-regular text-text-secondary">
                <p>
                  Upload your referral CSV. The engine scans for incomplete patient fields, verifies clinical entities, and allocates available clinicians automatically.
                </p>
                <div className="rounded-[8px] border border-blue-100 bg-blue-50/50 p-3 text-caption-1-regular text-blue-900">
                  <span className="font-semibold">Required fields:</span> Patient Name, DOB, Primary Condition, Priority, Referring Provider.
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-[#d0d5dd] p-8 text-center cursor-pointer transition hover:border-[#007aff] hover:bg-slate-50"
              >
                <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-body-2-medium text-text-primary">
                  {isProcessing ? "Scanning fields and allocating nurses..." : "Click to select CSV roster"}
                </span>
                <span className="text-caption-2-regular text-text-tertiary">
                  Accepts .csv and plain text formatted tables
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="flex items-center justify-between border-t border-[#eaecf0] pt-4">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-caption-1-medium text-[#007aff] hover:underline"
                >
                  Download Sample CSV Template
                </button>

                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="rounded-[8px] border border-[#d0d5dd] bg-white px-3.5 py-1.5 text-caption-1-medium text-text-secondary hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}