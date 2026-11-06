// components/application/referrals/next-action-card.tsx
import Link from "next/link";
import { DerivedCaseStatus } from "@/types/referral";

interface NextActionCardProps {
  caseId: string;
  status: DerivedCaseStatus;
  missingFieldsCount?: number;
}

export function NextActionCard({ caseId, status, missingFieldsCount = 0 }: NextActionCardProps) {
  if (status === "Awaiting Validation") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[8px] border border-[#007AFF]/30 bg-[#007AFF]/5 p-4 shadow-2xs">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#007AFF] block">
            Required Next Action
          </span>
          <h4 className="text-[15px] font-[500] text-[#101828] mt-0.5">
            Verify AI-extracted details against original referral
          </h4>
          <p className="text-[13px] text-[#475467]">
            Caregiver matching cannot start until an operator or reviewer confirms clinical requirements.
          </p>
        </div>
        <Link
          href={`/referrals/${caseId}/validate`}
          className="inline-flex items-center justify-center rounded-[6px] bg-[#007AFF] px-4 py-2 text-[14px] font-medium text-white hover:bg-[#0066CC] transition-colors shrink-0 shadow-xs"
        >
          Open Validation Desk &rarr;
        </Link>
      </div>
    );
  }

  if (status === "Duplicate Flagged") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[8px] border border-[#FF9500]/40 bg-[#FF9500]/10 p-4 shadow-2xs">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B26A00] block">
            Attention Required
          </span>
          <h4 className="text-[15px] font-[500] text-[#101828] mt-0.5">
            Resolve potential duplicate referral
          </h4>
          <p className="text-[13px] text-[#475467]">
            This patient appears to match an existing active case. Confirm whether to link or proceed independently.
          </p>
        </div>
        <Link
          href={`/referrals/${caseId}/validate`}
          className="inline-flex items-center justify-center rounded-[6px] bg-[#B26A00] px-4 py-2 text-[14px] font-medium text-white hover:bg-[#935600] transition-colors shrink-0 shadow-xs"
        >
          Review Match &rarr;
        </Link>
      </div>
    );
  }

  if (status === "Recommendations Ready") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[8px] border border-[#34C759]/40 bg-[#34C759]/10 p-4 shadow-2xs">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1E7E34] block">
            Decision Required
          </span>
          <h4 className="text-[15px] font-[500] text-[#101828] mt-0.5">
            Review ranked caregiver candidates
          </h4>
          <p className="text-[13px] text-[#475467]">
            Deterministic matching has produced candidates. Sign off to deploy care.
          </p>
        </div>
        <a
          href="#matching-section"
          className="inline-flex items-center justify-center rounded-[6px] bg-[#1E7E34] px-4 py-2 text-[14px] font-medium text-white hover:bg-[#166329] transition-colors shrink-0 shadow-xs"
        >
          Inspect Candidates &darr;
        </a>
      </div>
    );
  }

  if (status === "Needs Correction") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[8px] border border-[#FF9500]/40 bg-[#FF9500]/10 p-4 shadow-2xs">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B26A00] block">
            Incomplete Profile
          </span>
          <h4 className="text-[15px] font-[500] text-[#101828] mt-0.5">
            {missingFieldsCount} required field{missingFieldsCount === 1 ? "" : "s"} missing
          </h4>
          <p className="text-[13px] text-[#475467]">
            Please supply all required clinical entities to enable matching readiness.
          </p>
        </div>
        <Link
          href={`/referrals/${caseId}/validate`}
          className="inline-flex items-center justify-center rounded-[6px] border border-[#D0D5DD] bg-white px-4 py-2 text-[14px] font-medium text-[#344054] hover:bg-[#F8FAFC] transition-colors shrink-0"
        >
          Correct Missing Fields &rarr;
        </Link>
      </div>
    );
  }

  return null;
}