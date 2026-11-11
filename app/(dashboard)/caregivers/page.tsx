// app/(dashboard)/caregivers/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CaregiverDirectoryRecord, 
  AvailabilityStatus,
  ScreeningStatus,
  CaregiverRecordStatus,
  CaregiverQualification
} from "@/types/caregiver";
import { 
  getStoredCaregivers, 
  saveStoredCaregivers, 
  computeCaregiverMetrics 
} from "@/lib/caregiver-directory-service";
import { AddCaregiverModal } from "@/components/application/caregiver/add-caregiver-modal";

type SortField = "name" | "qualification" | "zipCode" | "availability" | "screening" | "status";
type SortOrder = "asc" | "desc";

export default function CaregiverDirectoryPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [caregivers, setCaregivers] = useState<CaregiverDirectoryRecord[]>([]);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("All");
  const [qualificationFilter, setQualificationFilter] = useState<string>("All");
  const [screeningFilter, setScreeningFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [zipFilter, setZipFilter] = useState<string>("");

  // Sorting & Pagination
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Add Caregiver Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const records = getStoredCaregivers();
    setCaregivers(records);
  }, []);

  // Compute live summary indicators from records
  const metrics = useMemo(() => {
    return computeCaregiverMetrics(caregivers);
  }, [caregivers]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery !== "" ||
      availabilityFilter !== "All" ||
      qualificationFilter !== "All" ||
      screeningFilter !== "All" ||
      statusFilter !== "All" ||
      zipFilter !== ""
    );
  }, [searchQuery, availabilityFilter, qualificationFilter, screeningFilter, statusFilter, zipFilter]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setAvailabilityFilter("All");
    setQualificationFilter("All");
    setScreeningFilter("All");
    setStatusFilter("All");
    setZipFilter("");
    setCurrentPage(1);
  };

  // Filter & Search Logic
  const filteredCaregivers = useMemo(() => {
    return caregivers.filter((c: CaregiverDirectoryRecord) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.qualification.toLowerCase().includes(q) ||
        c.zipCode.includes(q);

      const matchesAvailability =
        availabilityFilter === "All" || c.availability === availabilityFilter;

      const matchesQualification =
        qualificationFilter === "All" || c.qualification === qualificationFilter;

      const matchesScreening =
        screeningFilter === "All" || c.screening === screeningFilter;

      const matchesStatus =
        statusFilter === "All" || c.status === statusFilter;

      const matchesZip =
        zipFilter.trim() === "" || c.zipCode.includes(zipFilter.trim());

      return (
        matchesSearch &&
        matchesAvailability &&
        matchesQualification &&
        matchesScreening &&
        matchesStatus &&
        matchesZip
      );
    });
  }, [
    caregivers,
    searchQuery,
    availabilityFilter,
    qualificationFilter,
    screeningFilter,
    statusFilter,
    zipFilter,
  ]);

  // Sorting
  const sortedCaregivers = useMemo(() => {
    return [...filteredCaregivers].sort((a: CaregiverDirectoryRecord, b: CaregiverDirectoryRecord) => {
      const valA = a[sortField] || "";
      const valB = b[sortField] || "";
      const compare = String(valA).localeCompare(String(valB));
      return sortOrder === "asc" ? compare : -compare;
    });
  }, [filteredCaregivers, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedCaregivers.length / pageSize) || 1;
  const paginatedCaregivers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCaregivers.slice(start, start + pageSize);
  }, [sortedCaregivers, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleAddSuccess = (newCg: CaregiverDirectoryRecord) => {
    const updated = [newCg, ...caregivers];
    setCaregivers(updated);
    saveStoredCaregivers(updated);
  };

  const openProfile = (cg: CaregiverDirectoryRecord) => {
    router.push(`/caregivers/${encodeURIComponent(cg.id)}`);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-8">
        <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10 font-sans text-[#101828]">
          <div className="border-b border-[#EAECF0] pb-5">
            <h1 className="text-[28px] font-semibold tracking-tight text-[#101828]">Care Givers</h1>
            <p className="mt-1 text-[14px] text-[#475467]">
              Manage and review caregiver profiles, qualifications, screening information and availability.
            </p>
          </div>
          <div className="rounded-xl border border-[#EAECF0] bg-white p-12 text-center text-[#667085]">
            Loading caregiver directory...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10 font-sans text-[#101828]">
        
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#EAECF0] pb-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-[#101828]">
              Care Givers
            </h1>
            <p className="mt-1 text-[14px] text-[#475467]">
              Manage and review caregiver profiles, qualifications, screening information and availability.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#007AFF] px-4 py-2.5 text-[14px] font-semibold text-white shadow-xs hover:bg-[#0062CC] transition-colors"
          >
            <span>+ Add Care Giver</span>
          </button>
        </div>

        {/* Summary Indicators */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#EAECF0] bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] block">
              Total Care Givers
            </span>
            <span className="mt-1 text-[22px] font-bold text-[#101828] block">
              {metrics.total}
            </span>
          </div>

          <div className="rounded-xl border border-[#EAECF0] bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#34C759] block">
              Available
            </span>
            <span className="mt-1 text-[22px] font-bold text-[#248A3D] block">
              {metrics.available}
            </span>
          </div>

          <div className="rounded-xl border border-[#EAECF0] bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#007AFF] block">
              On Assignment
            </span>
            <span className="mt-1 text-[22px] font-bold text-[#007AFF] block">
              {metrics.onAssignment}
            </span>
          </div>

          <div className="rounded-xl border border-[#EAECF0] bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F79009] block">
              Under Review
            </span>
            <span className="mt-1 text-[22px] font-bold text-[#B26A00] block">
              {metrics.underReview}
            </span>
          </div>
        </div>

        {/* Search & Multi-Filter Toolbar */}
        <div className="rounded-xl border border-[#EAECF0] bg-white p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, caregiver ID, qualification or ZIP code..."
                className="w-full rounded-lg border border-[#D0D5DD] bg-white py-2 pl-10 pr-4 text-[13px] text-[#101828] placeholder-[#667085] shadow-xs focus:border-[#007AFF] focus:outline-none"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="self-center whitespace-nowrap text-[12px] font-semibold text-[#007AFF] hover:underline px-2 py-1"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5 text-[12px]">
            <div>
              <label className="block text-[11px] font-medium text-[#667085] mb-1">
                Availability
              </label>
              <select
                value={availabilityFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setAvailabilityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              >
                <option value="All">All Availabilities</option>
                <option value="Available">Available</option>
                <option value="Limited Availability">Limited Availability</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#667085] mb-1">
                Qualification
              </label>
              <select
                value={qualificationFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setQualificationFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              >
                <option value="All">All Qualifications</option>
                <option value="Registered Nurse (RN)">Registered Nurse (RN)</option>
                <option value="Home Health Aide (HHA)">Home Health Aide (HHA)</option>
                <option value="Physical Therapist (PT)">Physical Therapist (PT)</option>
                <option value="Occupational Therapist (OT)">Occupational Therapist (OT)</option>
                <option value="Certified Nursing Assistant (CNA)">CNA</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#667085] mb-1">
                Voice Screening
              </label>
              <select
                value={screeningFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setScreeningFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              >
                <option value="All">All Screening</option>
                <option value="Completed">Completed</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Pending">Pending</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#667085] mb-1">
                Caregiver Status
              </label>
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Assignment">On Assignment</option>
                <option value="Under Review">Under Review</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#667085] mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                value={zipFilter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setZipFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="e.g. 15213"
                className="w-full rounded-lg border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="rounded-xl border border-[#EAECF0] bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead className="border-b border-[#EAECF0] bg-[#F8FAFC] text-[11px] uppercase font-semibold text-[#667085] tracking-wider">
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    className="py-3 px-5 cursor-pointer hover:text-[#101828]"
                  >
                    Care Giver {sortField === "name" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("qualification")}
                    className="py-3 px-4 cursor-pointer hover:text-[#101828]"
                  >
                    Qualification {sortField === "qualification" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("zipCode")}
                    className="py-3 px-4 cursor-pointer hover:text-[#101828]"
                  >
                    Location {sortField === "zipCode" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("availability")}
                    className="py-3 px-4 cursor-pointer hover:text-[#101828]"
                  >
                    Availability {sortField === "availability" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("screening")}
                    className="py-3 px-4 cursor-pointer hover:text-[#101828]"
                  >
                    Screening {sortField === "screening" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="py-3 px-4 cursor-pointer hover:text-[#101828]"
                  >
                    Status {sortField === "status" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {paginatedCaregivers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center">
                      <div className="mx-auto max-w-sm">
                        <span className="text-[14px] font-semibold text-[#101828] block">
                          No caregivers found
                        </span>
                        <p className="mt-1 text-[13px] text-[#667085]">
                          No caregiver records matched your combined search and filter criteria.
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="mt-3 text-[12px] font-semibold text-[#007AFF] hover:underline"
                          >
                            Reset filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCaregivers.map((cg: CaregiverDirectoryRecord) => (
                    <tr
                      key={cg.id}
                      onClick={() => openProfile(cg)}
                      className="cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF] font-semibold text-[13px]">
                            {cg.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <span className="font-semibold text-[#101828] block">
                              {cg.name}
                            </span>
                            <span className="font-mono text-[11px] text-[#667085]">
                              {cg.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-[#344054]">
                        {cg.qualification}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-medium text-[#101828]">
                          ZIP {cg.zipCode}
                        </span>
                        <span className="block text-[11px] text-[#667085] truncate max-w-[180px]">
                          {cg.serviceArea}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            cg.availability === "Available"
                              ? "bg-[#34C759]/15 text-[#248A3D]"
                              : cg.availability === "Limited Availability"
                              ? "bg-[#F79009]/15 text-[#B26A00]"
                              : "bg-[#EAECF0] text-[#667085]"
                          }`}
                        >
                          {cg.availability}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              cg.screening === "Completed"
                                ? "bg-[#007AFF]/10 text-[#007AFF]"
                                : cg.screening === "Needs Review"
                                ? "bg-[#FF3B30]/10 text-[#FF3B30]"
                                : "bg-[#EAECF0] text-[#667085]"
                            }`}
                          >
                            {cg.screening}
                          </span>
                          {cg.voiceScreeningScore && (
                            <span className="font-mono text-[11px] text-[#667085]">
                              ({cg.voiceScreeningScore})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            cg.status === "Active"
                              ? "bg-[#34C759]/15 text-[#248A3D]"
                              : cg.status === "On Assignment"
                              ? "bg-[#007AFF]/15 text-[#007AFF]"
                              : cg.status === "Under Review"
                              ? "bg-[#F79009]/15 text-[#B26A00]"
                              : "bg-[#EAECF0] text-[#667085]"
                          }`}
                        >
                          {cg.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            openProfile(cg);
                          }}
                          className="rounded-md px-2.5 py-1 text-[12px] font-medium text-[#007AFF] hover:bg-[#007AFF]/10 transition-colors"
                        >
                          View Profile &rarr;
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {sortedCaregivers.length > 0 && (
            <div className="border-t border-[#EAECF0] px-5 py-3.5 bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#667085]">
              <div>
                Showing <strong className="text-[#101828]">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
                <strong className="text-[#101828]">
                  {Math.min(currentPage * pageSize, sortedCaregivers.length)}
                </strong>{" "}
                of <strong className="text-[#101828]">{sortedCaregivers.length}</strong> caregivers
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
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
                  onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                  className="rounded border border-[#D0D5DD] bg-white px-3 py-1 font-medium text-[#344054] hover:bg-[#F2F4F7] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Caregiver Modal */}
        <AddCaregiverModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddSuccess={handleAddSuccess}
        />

      </main>
    </div>
  );
}