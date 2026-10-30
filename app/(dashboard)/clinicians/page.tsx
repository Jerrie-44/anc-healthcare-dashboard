// app/(dashboard)/clinicians/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_CLINICIANS, Clinician } from "@/types/clinician";

export default function CliniciansDirectoryPage() {
  const [search, setSearch] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("All");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("All");

  const disciplines = useMemo(() => {
    const list = Array.from(new Set(MOCK_CLINICIANS.map((c) => c.discipline)));
    return ["All", ...list];
  }, []);

  const filteredClinicians = useMemo(() => {
    return MOCK_CLINICIANS.filter((clinician) => {
      const matchesSearch =
        clinician.name.toLowerCase().includes(search.toLowerCase()) ||
        clinician.id.toLowerCase().includes(search.toLowerCase()) ||
        clinician.credentials.some((cred) =>
          cred.toLowerCase().includes(search.toLowerCase())
        );

      const matchesDiscipline =
        selectedDiscipline === "All" || clinician.discipline === selectedDiscipline;

      const matchesAvailability =
        selectedAvailability === "All" ||
        clinician.availability === selectedAvailability;

      return matchesSearch && matchesDiscipline && matchesAvailability;
    });
  }, [search, selectedDiscipline, selectedAvailability]);

  // Aggregate Metrics
  const totalClinicians = MOCK_CLINICIANS.length;
  const immediateAvailable = MOCK_CLINICIANS.filter(
    (c) => c.availability === "Immediate"
  ).length;
  const averageCaseloadRatio = Math.round(
    (MOCK_CLINICIANS.reduce(
      (acc, c) => acc + c.activeCaseload / c.maxCaseload,
      0
    ) /
      totalClinicians) *
      100
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8fafc] p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6">

        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-display-4-medium tracking-tight text-text-primary">
              Clinician Roster
            </h1>
            <p className="mt-1 text-body-2-regular text-text-secondary">
              Monitor provider capacity, credentials, active caseloads, and geographic field coverage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/referrals"
              className="inline-flex items-center justify-center rounded-[10px] border border-[#d0d5dd] bg-white px-4 py-2 text-body-2-medium text-[#344054] shadow-xs transition hover:bg-[#f9fafb]"
            >
              &larr; Referrals Queue
            </Link>
          </div>
        </div>

        {/* Clinician Roster Metrics Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Total Providers */}
          <div className="flex flex-col justify-between overflow-hidden rounded-[10px] border border-[#eaecf0] bg-white shadow-xs transition hover:border-[#b2d5ff]">
            <div className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-caption-1-medium text-text-tertiary">
                  Active Clinicians
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-linear-to-br from-blue-500/10 to-indigo-500/10 text-[#007aff]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-display-3-bold text-text-primary">
                  {totalClinicians}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-caption-2-bold font-semibold text-emerald-700">
                  100% Active
                </span>
              </div>
            </div>
            <div className="border-t border-[#eaecf0] bg-[#fcfcfd] px-5 py-2.5">
              <span className="text-caption-2-regular text-text-tertiary">
                RNs, PTs, and OTR/Ls certified
              </span>
            </div>
          </div>

          {/* Immediate Availability */}
          <div className="flex flex-col justify-between overflow-hidden rounded-[10px] border border-[#eaecf0] bg-white shadow-xs transition hover:border-[#b2d5ff]">
            <div className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-caption-1-medium text-text-tertiary">
                  Immediate Field Availability
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-linear-to-br from-emerald-500/10 to-teal-500/10 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-display-3-bold text-emerald-700">
                  {immediateAvailable}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-caption-2-bold font-semibold text-emerald-700">
                  &lt; 24h
                </span>
              </div>
            </div>
            <div className="border-t border-[#eaecf0] bg-[#fcfcfd] px-5 py-2.5">
              <span className="text-caption-2-regular text-text-tertiary">
                Ready for urgent triage dispatch
              </span>
            </div>
          </div>

          {/* Average Caseload Utilization */}
          <div className="flex flex-col justify-between overflow-hidden rounded-[10px] border border-[#eaecf0] bg-white shadow-xs transition hover:border-[#b2d5ff]">
            <div className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-caption-1-medium text-text-tertiary">
                  Network Capacity Utilization
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-linear-to-br from-purple-500/10 to-pink-500/10 text-purple-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-display-3-bold text-text-primary">
                  {averageCaseloadRatio}%
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-caption-2-bold font-semibold text-slate-700">
                  Target: &lt;85%
                </span>
              </div>
            </div>
            <div className="border-t border-[#eaecf0] bg-[#fcfcfd] px-5 py-2.5">
              <span className="text-caption-2-regular text-text-tertiary">
                Balanced load across all field zones
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-col gap-3 rounded-[10px] border border-[#eaecf0] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clinician name, ID, or credential (RN, PT, WCC)..."
              className="w-full rounded-[10px] border border-[#d0d5dd] bg-slate-50 py-2 pr-3 pl-9 text-body-2-medium text-text-primary transition focus:border-[#007aff] focus:bg-white focus:outline-none"
            />
            <svg
              className="absolute top-2.5 left-3 h-4 w-4 text-text-tertiary"
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
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="rounded-[10px] border border-[#d0d5dd] bg-white px-3 py-2 text-body-2-medium text-text-primary focus:border-[#007aff] focus:outline-none"
            >
              {disciplines.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All Disciplines" : d}
                </option>
              ))}
            </select>

            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="rounded-[10px] border border-[#d0d5dd] bg-white px-3 py-2 text-body-2-medium text-text-primary focus:border-[#007aff] focus:outline-none"
            >
              <option value="All">All Availabilities</option>
              <option value="Immediate">Immediate (&lt; 24h)</option>
              <option value="Within 48h">Within 48h</option>
              <option value="Next Week">Next Week</option>
            </select>
          </div>
        </div>

        {/* Clinicians Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredClinicians.map((clinician) => {
            const usagePercent = Math.round(
              (clinician.activeCaseload / clinician.maxCaseload) * 100
            );

            return (
              <div
                key={clinician.id}
                className="flex flex-col justify-between rounded-[10px] border border-[#eaecf0] bg-white p-5 shadow-xs transition hover:border-[#b2d5ff]"
              >
                <div className="flex flex-col gap-4">
                  {/* Top card metadata */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-body-medium font-semibold text-text-primary">
                        {clinician.name}
                      </h3>
                      <p className="text-body-2-regular text-text-secondary">
                        {clinician.discipline}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        clinician.availability === "Immediate"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : clinician.availability === "Within 48h"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {clinician.availability}
                    </span>
                  </div>

                  {/* Credentials & Languages */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {clinician.credentials.map((cred) => (
                      <span
                        key={cred}
                        className="rounded-[6px] border border-[#eaecf0] bg-slate-50 px-2 py-0.5 text-caption-2-medium text-text-secondary"
                      >
                        {cred}
                      </span>
                    ))}
                    <span className="text-caption-2-regular text-text-tertiary ml-1">
                      &bull; {clinician.languages.join(", ")}
                    </span>
                  </div>

                  {/* Zone & Contact details */}
                  <div className="flex flex-col gap-1.5 border-t border-[#eaecf0] pt-3 text-body-2-regular text-text-secondary">
                    <div className="flex items-center justify-between">
                      <span className="text-text-tertiary">Coverage:</span>
                      <span className="font-medium text-text-primary text-right">
                        {clinician.coverageZone}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-tertiary">Direct:</span>
                      <span className="font-mono text-caption-1-regular text-text-primary">
                        {clinician.phone}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-tertiary">Rating:</span>
                      <span className="font-medium text-text-primary">
                        ★ {clinician.rating} / 5.0
                      </span>
                    </div>
                  </div>

                  {/* Caseload Bar */}
                  <div className="flex flex-col gap-1.5 border-t border-[#eaecf0] pt-3">
                    <div className="flex items-center justify-between text-caption-1-medium">
                      <span className="text-text-tertiary">Current Caseload</span>
                      <span className="text-text-primary">
                        {clinician.activeCaseload} / {clinician.maxCaseload}{" "}
                        <span className="text-text-tertiary">({usagePercent}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          usagePercent >= 90
                            ? "bg-rose-500"
                            : usagePercent >= 75
                            ? "bg-amber-500"
                            : "bg-[#007aff]"
                        }`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action -> Links directly to the profile view */}
                <div className="mt-5 pt-3 border-t border-[#eaecf0]">
                  <Link
                    href={`/clinicians/${clinician.id}`}
                    className="flex w-full items-center justify-center rounded-[10px] border border-[#d0d5dd] bg-white py-2 text-body-2-medium text-[#344054] shadow-xs transition hover:bg-[#f9fafb]"
                  >
                    View Profile &amp; Caseload &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredClinicians.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[10px] border border-[#eaecf0] bg-white p-12 text-center">
            <p className="text-body-medium font-medium text-text-primary">
              No clinicians match the selected criteria
            </p>
            <p className="mt-1 text-body-2-regular text-text-secondary">
              Try adjusting your search terms, discipline filter, or availability status.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}