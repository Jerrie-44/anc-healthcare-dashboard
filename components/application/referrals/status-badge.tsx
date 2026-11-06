// components/application/referrals/status-badge.tsx
import { DerivedCaseStatus } from "@/types/referral";

interface StatusBadgeProps {
  status: DerivedCaseStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]";

  switch (status) {
    case "Awaiting Validation":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#007AFF]/10 font-medium text-[#007AFF] ${sizeClasses}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF]" />
          Awaiting Validation
        </span>
      );
    case "Duplicate Flagged":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FF9500]/15 font-medium text-[#B26A00] ${sizeClasses}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF9500]" />
          Duplicate Review Required
        </span>
      );
    case "Needs Correction":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FF9500]/15 font-medium text-[#B26A00] ${sizeClasses}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF9500]" />
          Needs Correction
        </span>
      );
    case "On Hold":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#F2F4F7] font-medium text-[#475467] border border-[#D0D5DD] ${sizeClasses}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#667085]" />
          On Hold
        </span>
      );
    case "Matching in Progress":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#007AFF]/10 font-medium text-[#007AFF] ${sizeClasses}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#007AFF] animate-pulse" />
          Matching in Progress
        </span>
      );
    case "Recommendations Ready":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#34C759]/15 font-medium text-[#1E7E34] ${sizeClasses}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />
          Recommendations Ready
        </span>
      );
    case "Approved":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#34C759]/15 font-medium text-[#1E7E34] ${sizeClasses}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />
          Placement Approved
        </span>
      );
    case "Processing":
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#F2F4F7] font-medium text-[#475467] ${sizeClasses}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#98A2B3] animate-pulse" />
          Processing
        </span>
      );
  }
}