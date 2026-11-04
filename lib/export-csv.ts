// lib/export-csv.ts
import { Referral } from "@/types/referral";

export function exportReferralsToCSV(referrals: Referral[], filename = "anc-referrals-export.csv") {
  if (!referrals.length) return;

  const headers = [
    "Case ID",
    "Patient Name",
    "DOB",
    "Primary Condition",
    "Priority",
    "Triage Stage",
    "Extraction Status",
    "Referring Provider",
    "Received Date",
  ];

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === null || val === undefined) return '""';
    const stringVal = String(val).replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const rows = referrals.map((r) => [
    escapeCSV(r.id),
    escapeCSV(r.patientName),
    escapeCSV(r.dob),
    escapeCSV(r.primaryCondition),
    escapeCSV(r.priority),
    escapeCSV(r.triageStage),
    escapeCSV(r.extractionStatus),
    escapeCSV(r.referringProvider),
    escapeCSV(r.receivedDate),
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}