// app/(dashboard)/post-matchmaking/page.tsx
"use client";

import { Suspense, useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getPostMatchCases,
  PostMatchCaseView,
  PostMatchStatus,
} from "@/lib/post-matchmaking-service";

type SortField = "lastUpdated" | "matchScore" | "status";
type SortOrder = "asc" | "desc";

function PostMatchmakingOverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const simulateEmptyState = searchParams.get("empty") === "true";

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [cases, setCases] = useState<PostMatchCaseView[]>([]);

  // Search & Multi-filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [requirementFilter, setRequirementFilter] = useState<string>("All");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Sorting & Pagination
  const [sortField, setSortField] = useState<SortField>("lastUpdated");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  const loadCases = useCallback(() => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const result = getPostMatchCases(simulateEmptyState);
      setCases(result.cases);
    } catch {
      setFetchError(
        "Unable to retrieve post-matchmaking records from the database."
      );
    } finally {
      setIsLoading(false);
    }
  }, [simulateEmptyState]);

  useEffect(() => {
    setIsMounted(true);
    loadCases();
  }, [loadCases]);

  // 3 Summary Indicators (Excluding Unmatched Cases per specification)
  const summaryMetrics = useMemo(() => {
    const awaitingValidation = cases.filter(
      (c) => c.status === "Awaiting Validation"
    ).length;
    const validatedMatches = cases.filter(
      (c) => c.status === "Validated"
    ).length;
    const totalMatchedCases = awaitingValidation + validatedMatches;

    return {
      totalMatchedCases,
      awaitingValidation,
      validatedMatches,
    };
  }, [cases]);

  // Dynamic Care Requirement filter options
  const availableRequirements = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c) => {
      if (c.disciplineNeeded) set.add(c.disciplineNeeded);
    });
    return Array.from(set);
  }, [cases]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== "" ||
      statusFilter !== "All" ||
      requirementFilter !== "All" ||
      locationFilter.trim() !== "" ||
      dateFilter.trim() !== ""
    );
  }, [
    searchQuery,
    statusFilter,
    requirementFilter,
    locationFilter,
    dateFilter,
  ]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setRequirementFilter("All");
    setLocationFilter("");
    setDateFilter("");
    setCurrentPage(1);
  };

  // Filter logic across all criteria
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        c.patientName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.recommendedCaregiverName &&
          c.recommendedCaregiverName.toLowerCase().includes(q)) ||
        (c.recommendedCaregiverId &&
          c.recommendedCaregiverId.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "All" || c.status === statusFilter;

      const matchesRequirement =
        requirementFilter === "All" || c.disciplineNeeded === requirementFilter;

      const matchesLocation =
        locationFilter.trim() === "" ||
        c.location.toLowerCase().includes(locationFilter.toLowerCase().trim()) ||
        c.zipCode.includes(locationFilter.trim());

      const matchesDate =
        dateFilter.trim() === "" || c.dateMatched.startsWith(dateFilter.trim());

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRequirement &&
        matchesLocation &&
        matchesDate
      );
    });
  }, [
    cases,
    searchQuery,
    statusFilter,
    requirementFilter,
    locationFilter,
    dateFilter,
  ]);

  // Sorting
  const sortedCases = useMemo(() => {
    return [...filteredCases].sort((a, b) => {
      let compare = 0;
      if (sortField === "lastUpdated") {
        compare = a.lastUpdated.localeCompare(b.lastUpdated);
      } else if (sortField === "matchScore") {
        const scoreA = a.matchScore ?? -1;
        const scoreB = b.matchScore ?? -1;
        compare = scoreA - scoreB;
      } else if (sortField === "status") {
        compare = a.status.localeCompare(b.status);
      }
      return sortOrder === "asc" ? compare : -compare;
    });
  }, [filteredCases, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedCases.length / pageSize) || 1;
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCases.slice(start, start + pageSize);
  }, [sortedCases, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const renderStatusBadge = (status: PostMatchStatus) => {
    switch (status) {
      case "Awaiting Validation":
        return (
          <span className="inline-flex items-center rounded-full bg-[#007AFF]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#007AFF]">
            Awaiting Validation
          </span>
        );
      case "Validated":
        return (
          <span className="inline-flex items-center rounded-full bg-[#34C759]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#248A3D]">
            Validated
          </span>
        );
      case "Unmatched":
        return (
          <span className="inline-flex items-center rounded-full bg-[#F79009]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#B26A00]">
            Unmatched
          </span>
        );
      case "Needs Review":
        return (
          <span className="inline-flex items-center rounded-full bg-[#FF3B30]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#FF3B30]">
            Needs Review
          </span>
        );
    }
  };

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-8 font-sans text-[#101828]">
        <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
          <div className="border-b border-[#EAECF0] pb-5">
            <h1 className="text-[28px] font-semibold tracking-tight text-[#101828]">
              Post-Matchmaking
            </h1>
            <p className="mt-1 text-[14px] text-[#475467]">
              Track matched cases, review recommended caregivers and monitor validation outcomes.
            </p>
          </div>
          <div className="rounded-xl border border-[#EAECF0] bg-white p-12 text-center text-[14px] text-[#667085] shadow-xs">
            Loading post-matchmaking workspace...
          </div>
        </main>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-8 font-sans text-[#101828]">
        <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
          <div className="border-b border-[#EAECF0] pb-5">
            <h1 className="text-[28px] font-semibold tracking-tight text-[#101828]">
              Post-Matchmaking
            </h1>
          </div>
          <div className="rounded-xl border border-[#FF3B30]/20 bg-white p-12 text-center shadow-xs">
            <h2 className="text-[18px] font-semibold text-[#101828]">
              Failed to Load Matching Records
            </h2>
            <p className="mt-1 text-[13px] text-[#667085]">{fetchError}</p>
            <button
              type="button"
              onClick={loadCases}
              className="mt-4 rounded-lg bg-[#007AFF] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#0062CC]"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Conditional Empty State Variant (Displayed only when backend returns 0 matched cases)
  if (cases.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-8 font-sans text-[#101828]">
        <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
          <div className="border-b border-[#EAECF0] pb-5">
            <h1 className="text-[28px] font-semibold tracking-tight text-[#101828]">
              Post-Matchmaking
            </h1>
            <p className="mt-1 text-[14px] text-[#475467]">
              Track matched cases, review recommended caregivers and monitor validation outcomes.
            </p>
          </div>

          <div className="my-20 flex w-full flex-col items-center justify-center text-center">
            <h2 className="max-w-lg text-[24px] font-semibold tracking-tight text-[#101828]">
              No matched cases yet
            </h2>
            <p className="mt-2.5 max-w-lg text-[14px] leading-relaxed text-[#475467]">
              Once referral cases are processed through the Match Engine, AI-ranked caregiver recommendations will appear here for human validation.
            </p>
            <div className="mt-7">
              <Link
                href="/cases-intake"
                className="inline-flex items-center gap-2 rounded-lg bg-[#007AFF] px-5 py-2.5 text-[14px] font-semibold text-white shadow-xs hover:bg-[#0062CC] transition-colors"
              >
                <span>Go to Cases Intake</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-sans text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
        
        {/* Page Header with Search */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#EAECF0] pb-5 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-[#101828]">
              Post-Matchmaking
            </h1>
            <p className="mt-1 text-[14px] text-[#475467]">
              Track matched cases, review recommended caregivers and monitor validation outcomes.
            </p>
          </div>

          <div className="relative w-full lg:w-96">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by patient name, case ID or caregiver..."
              className="w-full rounded-lg border border-[#D0D5DD] bg-white py-2 pl-10 pr-4 text-[13px] text-[#101828] placeholder-[#667085] shadow-xs focus:border-[#007AFF] focus:outline-none"
            />
          </div>
        </div>

        {/* 3 Compact Summary Indicators in One Horizontal Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#D0D5DD]/70 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] block">
              Total Matched Cases
            </span>
            <span className="mt-1 text-[24px] font-semibold text-[#101828] block">
              {summaryMetrics.totalMatchedCases}
            </span>
          </div>

          <div className="rounded-xl border border-[#D0D5DD]/70 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#007AFF] block">
              Awaiting Validation
            </span>
            <span className="mt-1 text-[24px] font-semibold text-[#007AFF] block">
              {summaryMetrics.awaitingValidation}
            </span>
          </div>

          <div className="rounded-xl border border-[#D0D5DD]/70 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#248A3D] block">
              Validated Matches
            </span>
            <span className="mt-1 text-[24px] font-semibold text-[#248A3D] block">
              {summaryMetrics.validatedMatches}
            </span>
          </div>
        </div>

        {/* Search and Filtering Toolbar */}
        <div className="rounded-xl border border-[#EAECF0] bg-white p-4 shadow-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end text-[12px]">
            <div>
              <label className="block text-[11px] font-medium text-[#667085] mb-1">
                Match Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-[#D0D5DD] bg-[#F2F4F7] px-2.5 py-1.5 text-[#101828] focus:border-[#007AFF] focus:bg-white focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Awaiting Validation">Awaiting Validation</option>
                <option value="Validated">Validated</option>
                <option value="Unmatched">Unmatched</option>
                <option value="Needs Review">Needs Review</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#667085] mb-1">
                Care Requirement
              </label>
              <select
                value={requirementFilter}
                onChange={(e) => {
                  setRequirementFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-[#D0D5DD] bg-[#F2F4F7] px-2.5 py-1.5 text-[#101828] focus:border-[#007AFF] focus:bg-white focus:outline-none"
              >
                <option value="All">All Care Requirements</option>
                {availableRequirements.map((req) => (
                  <option key={req} value={req}>
                    {req}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#667085] mb-1">
                Location
              </label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="e.g. 15213"
                className="w-full rounded-lg border border-[#D0D5DD] bg-[#F2F4F7] px-2.5 py-1.5 text-[#101828] focus:border-[#007AFF] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#667085] mb-1">
                Date Matched
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-[#D0D5DD] bg-[#F2F4F7] px-2.5 py-1.5 text-[#101828] focus:border-[#007AFF] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-lg border border-[#D0D5DD] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#007AFF] hover:bg-[#F2F4F7]"
                >
                  Clear Filters
                </button>
              ) : (
                <span className="text-[11px] text-[#667085] py-1.5">
                  Showing {sortedCases.length} case(s)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cases Tracking Table */}
        <div className="overflow-hidden rounded-xl border border-[#EAECF0] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead className="border-b border-[#EAECF0] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                <tr>
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Care Requirement</th>
                  <th className="py-3 px-4">Recommended Caregiver</th>
                  <th
                    onClick={() => handleSort("matchScore")}
                    className="py-3 px-4 cursor-pointer hover:text-[#101828]"
                  >
                    Match Score{" "}
                    {sortField === "matchScore" &&
                      (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="py-3 px-4">Location</th>
                  <th
                    onClick={() => handleSort("status")}
                    className="py-3 px-4 cursor-pointer hover:text-[#101828]"
                  >
                    Match Status{" "}
                    {sortField === "status" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("lastUpdated")}
                    className="py-3 px-4 cursor-pointer hover:text-[#101828]"
                  >
                    Last Updated{" "}
                    {sortField === "lastUpdated" &&
                      (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {paginatedCases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center">
                      <div className="mx-auto max-w-sm">
                        <span className="text-[14px] font-semibold text-[#101828] block">
                          No matching cases found
                        </span>
                        <p className="mt-1 text-[13px] text-[#667085]">
                          No post-matchmaking records matched your current search or filter criteria.
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="mt-3 text-[12px] font-semibold text-[#007AFF] hover:underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCases.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() =>
                        router.push(
                          `/post-matchmaking/${encodeURIComponent(c.id)}`
                        )
                      }
                      className="cursor-pointer transition-colors hover:bg-[#F8FAFC]"
                    >
                      <td className="py-3.5 px-4 font-mono text-[12px] font-semibold text-[#101828]">
                        {c.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#101828]">
                        {c.patientName}
                      </td>
                      <td className="py-3.5 px-4 text-[#344054]">
                        {c.careRequirement}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.recommendedCaregiverName ? (
                          <div>
                            <span className="font-medium text-[#101828] block">
                              {c.recommendedCaregiverName}
                            </span>
                            {c.recommendedCaregiverId && (
                              <span className="font-mono text-[11px] text-[#667085]">
                                {c.recommendedCaregiverId}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[12px] italic text-[#667085]">
                            No eligible caregiver
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#101828]">
                        {c.matchScore !== null ? `${c.matchScore}%` : "—"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[12px] text-[#344054]">
                        {c.location}
                      </td>
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(c.status)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[12px] text-[#667085]">
                        {c.lastUpdated}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/post-matchmaking/${encodeURIComponent(c.id)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-md px-2.5 py-1 text-[12px] font-medium text-[#007AFF] hover:bg-[#007AFF]/10 transition-colors"
                        >
                          View Case &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {sortedCases.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-[#EAECF0] bg-[#F8FAFC] px-5 py-3 text-[12px] text-[#667085] sm:flex-row">
              <div>
                Showing{" "}
                <strong className="text-[#101828]">
                  {(currentPage - 1) * pageSize + 1}
                </strong>{" "}
                to{" "}
                <strong className="text-[#101828]">
                  {Math.min(currentPage * pageSize, sortedCases.length)}
                </strong>{" "}
                of{" "}
                <strong className="text-[#101828]">{sortedCases.length}</strong>{" "}
                cases
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded border border-[#D0D5DD] bg-white px-3 py-1 font-medium text-[#344054] hover:bg-[#F2F4F7] disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-2 font-mono">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="rounded border border-[#D0D5DD] bg-white px-3 py-1 font-medium text-[#344054] hover:bg-[#F2F4F7] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default function PostMatchmakingOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] py-8 font-sans text-[#101828]">
          <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
            <div className="rounded-xl border border-[#EAECF0] bg-white p-12 text-center text-[14px] text-[#667085]">
              Loading post-matchmaking workspace...
            </div>
          </main>
        </div>
      }
    >
      <PostMatchmakingOverviewContent />
    </Suspense>
  );
}