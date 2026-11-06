// app/(dashboard)/referrals/batches/[batchId]/page.tsx
"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MOCK_BULK_BATCHES } from "@/lib/bulk-import-service";
import { StagedReferralRecord } from "@/types/referral";

interface PageProps {
  params: Promise<{ batchId: string }>;
}

export default function BulkBatchDetailsPage({ params }: PageProps) {
  const { batchId } = use(params);
  const batch = MOCK_BULK_BATCHES.find(
    (b) => (b.batchId || b.id || "").toLowerCase() === batchId.toLowerCase()
  );
  if (!batch) notFound();

  const [records, setRecords] = useState<StagedReferralRecord[]>(batch.records);
  const [retryNotification, setRetryNotification] = useState<string | null>(null);

  const handleRetryFailedRecord = (recordId: string) => {
    setRecords((prev: StagedReferralRecord[]) =>
      prev.map((r: StagedReferralRecord) => {
        const identifier = r.tempId || r.id || "";
        if (identifier === recordId) {
          const generatedId = `REF-${Math.floor(4150 + Math.random() * 500)}`;
          return {
            ...r,
            isValid: true,
            isExcluded: false,
            validationErrors: [],
            createdReferralId: generatedId,
            recordStatus: "Awaiting Validation" as const,
            status: "Awaiting Validation" as const,
            parsedFields: {
              ...r.parsedFields,
              patientName: r.parsedFields?.patientName || "Remediated Intake Patient",
              zipCode: r.parsedFields?.zipCode || "15213",
              authorizedHours: r.parsedFields?.authorizedHours || 12,
            },
          };
        }
        return r;
      })
    );
    setRetryNotification(`Safe retry completed. New referral case registered for row without duplication.`);
    setTimeout(() => setRetryNotification(null), 3500);
  };

  const displayBatchId = batch.batchId || batch.id || "BATCH-UNKNOWN";

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10 font-['Clash_Grotesk'] text-[#101828]">
        
        {/* Breadcrumb & Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#eaecf0] pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#667085] mb-1">
              <Link href="/referrals" className="hover:text-[#007aff]">Cases &amp; Referrals</Link>
              <span>/</span>
              <span>Batches</span>
              <span>/</span>
              <span className="font-mono text-[#101828]">{displayBatchId}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[32px] font-[500] text-[#101828]">{displayBatchId}</h1>
              <span className="rounded-full bg-[#34c759]/15 px-3 py-0.5 text-[12px] font-medium text-[#34c759]">
                {batch.status}
              </span>
            </div>
            <p className="mt-1 text-[14px] text-[#667085]">
              Source: {batch.referralSource} &bull; Uploaded: {batch.uploadedAt} by {batch.uploadedBy}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/referrals/bulk"
              className="rounded-[6px] border border-[#eaecf0] bg-white px-3.5 py-2 text-[14px] text-[#344054] hover:bg-[#f8fafc]"
            >
              + Ingest Another Batch
            </Link>
            <Link
              href="/referrals"
              className="rounded-[6px] bg-[#007aff] px-4 py-2 text-[14px] font-medium text-white hover:bg-[#0066cc]"
            >
              Cases Directory &rarr;
            </Link>
          </div>
        </div>

        {/* Batch KPI Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-[8px] border border-[#eaecf0] bg-white p-5 shadow-xs">
            <span className="text-[12px] text-[#667085] uppercase tracking-wider block">Total Staged</span>
            <span className="text-[28px] font-[500] text-[#101828] mt-1 block">
              {batch.totalRecordsDetected ?? batch.totalRows ?? records.length}
            </span>
          </div>

          <div className="rounded-[8px] border border-[#eaecf0] bg-white p-5 shadow-xs">
            <span className="text-[12px] text-[#667085] uppercase tracking-wider block">Successfully Ingested</span>
            <span className="text-[28px] font-[500] text-[#34c759] mt-1 block">
              {batch.successfullyImported ?? batch.validRowsCount ?? 0}
            </span>
          </div>

          <div className="rounded-[8px] border border-[#eaecf0] bg-white p-5 shadow-xs">
            <span className="text-[12px] text-[#667085] uppercase tracking-wider block">Duplicate Flagged</span>
            <span className="text-[28px] font-[500] text-[#ff9500] mt-1 block">
              {batch.flaggedDuplicates ?? 0}
            </span>
          </div>

          <div className="rounded-[8px] border border-[#eaecf0] bg-white p-5 shadow-xs">
            <span className="text-[12px] text-[#667085] uppercase tracking-wider block">Failed / Excluded</span>
            <span className="text-[28px] font-[500] text-[#ef4444] mt-1 block">
              {batch.failedRecords ?? batch.errorRowsCount ?? 0}
            </span>
          </div>
        </div>

        {retryNotification && (
          <div className="rounded-[6px] border border-[#34c759]/40 bg-[#34c759]/10 p-3 text-[13px] text-[#101828]">
            {retryNotification}
          </div>
        )}

        {/* Record Details Table */}
        <div className="rounded-[8px] border border-[#eaecf0] bg-white p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-[18px] font-[500] text-[#101828]">Batch Records &amp; Case Handoff</h2>
            <p className="text-[12px] text-[#667085]">
              Each entry represents an independent referral lifecycle. Click any case ID to validate or match.
            </p>
          </div>

          <div className="overflow-x-auto rounded-[6px] border border-[#eaecf0]">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#eaecf0] bg-[#f8fafc] text-[12px] text-[#667085]">
                  <th className="py-2.5 px-3">Row #</th>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Patient Name</th>
                  <th className="py-2.5 px-3">Discipline</th>
                  <th className="py-2.5 px-3">ZIP</th>
                  <th className="py-2.5 px-3">Record Lifecycle Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecf0]">
                {records.map((r: StagedReferralRecord, idx: number) => {
                  const recordKey = r.tempId || r.id || `row-${idx}`;
                  const createdId = r.createdReferralId || "";

                  return (
                    <tr key={recordKey} className="hover:bg-[#f8fafc]/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-[12px] text-[#667085]">
                        #{r.rowNumber ?? idx + 1}
                      </td>

                      <td className="py-3 px-3 font-mono font-medium text-[#101828]">
                        {createdId ? (
                          <Link href={`/referrals/${createdId}`} className="text-[#007aff] hover:underline">
                            {createdId}
                          </Link>
                        ) : (
                          <span className="text-[#667085]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-medium text-[#101828]">
                        {r.parsedFields?.patientName || r.mappedPatientName || (
                          <span className="text-[#ef4444] italic">Invalid / Excluded</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-[#344054]">
                        {r.parsedFields?.careDiscipline || r.mappedDiscipline || "—"}
                      </td>

                      <td className="py-3 px-3 font-mono text-[12px]">
                        {r.parsedFields?.zipCode || r.mappedZip || "—"}
                      </td>

                      <td className="py-3 px-3">
                        {r.recordStatus === "Potential Duplicate" && (
                          <span className="inline-flex rounded-full bg-[#ff9500]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#ff9500]">
                            Potential Duplicate
                          </span>
                        )}
                        {r.recordStatus === "Awaiting Validation" && (
                          <span className="inline-flex rounded-full bg-[#007aff]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#007aff]">
                            Awaiting Validation
                          </span>
                        )}
                        {r.recordStatus === "Invalid" && (
                          <span className="inline-flex rounded-full bg-[#ef4444]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#ef4444]">
                            Invalid ({r.validationErrors?.[0] || "Formatting Error"})
                          </span>
                        )}
                        {r.recordStatus !== "Potential Duplicate" &&
                          r.recordStatus !== "Awaiting Validation" &&
                          r.recordStatus !== "Invalid" && (
                            <span className="inline-flex rounded-full bg-[#f2f4f7] px-2.5 py-0.5 text-[11px] font-medium text-[#475467]">
                              {r.recordStatus || r.status || "Pending Import"}
                            </span>
                          )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {createdId ? (
                          <Link
                            href={`/referrals/${createdId}/validate`}
                            className="rounded border border-[#eaecf0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#344054] hover:bg-[#f8fafc]"
                          >
                            Validate Case &rarr;
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRetryFailedRecord(recordKey)}
                            className="rounded border border-[#007aff] bg-[#007aff]/10 px-2.5 py-1 text-[11px] font-medium text-[#007aff] hover:bg-[#007aff]/20"
                          >
                            Remediate &amp; Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}