// app/(dashboard)/schedule/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_SCHEDULED_VISITS, ScheduledVisit } from "@/types/schedule";
import { MOCK_CLINICIANS } from "@/types/clinician";
import { MOCK_PLACEMENTS_DB } from "@/lib/placement-service";
import { Breadcrumb, BreadcrumbItem } from "@/components/base/breadcrumb/breadcrumb";
import { BookVisitModal } from "@/components/application/schedule/book-visit-modal";

export default function SchedulePage() {
  const [visits, setVisits] = useState<ScheduledVisit[]>(MOCK_SCHEDULED_VISITS);
  const [selectedDate, setSelectedDate] = useState("2026-10-30");
  const [selectedClinicianId, setSelectedClinicianId] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dates = [
    { label: "Today (Oct 29)", value: "2026-10-29" },
    { label: "Tomorrow (Oct 30)", value: "2026-10-30" },
    { label: "Saturday (Oct 31)", value: "2026-10-31" },
    { label: "Sunday (Nov 01)", value: "2026-11-01" },
  ];

  const handleBookVisit = (newVisit: ScheduledVisit) => {
    setVisits((prev) => [newVisit, ...prev]);
    setSelectedDate(newVisit.date);
  };

  const filteredVisits = useMemo(() => {
    return visits.filter((visit) => {
      const matchDate = visit.date === selectedDate;
      const matchClinician =
        selectedClinicianId === "All" || visit.clinicianId === selectedClinicianId;
      const matchStatus =
        statusFilter === "All" || visit.status === statusFilter;

      return matchDate && matchClinician && matchStatus;
    });
  }, [visits, selectedDate, selectedClinicianId, statusFilter]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8fafc] p-6 lg:p-10 font-['Clash_Grotesk'] text-[#101828]">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6">

        {/* Breadcrumb */}
        <Breadcrumb aria-label="Schedule Navigation">
          <BreadcrumbItem href="/referrals">Dashboard</BreadcrumbItem>
          <BreadcrumbItem current>Care Schedule &amp; Routing</BreadcrumbItem>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center py-1">
          <div>
            <h1 className="text-[32px] font-[500] leading-tight text-[#101828]">
              Field Care Schedule &amp; Routing
            </h1>
            <p className="mt-1 text-[14px] text-[#667085] max-w-3xl">
              Coordinate field visit appointments, track clinician dispatch, and eliminate coverage bottlenecks across active placements.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/placements"
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#eaecf0] bg-white px-3.5 py-2.5 text-[14px] font-[500] text-[#344054] shadow-xs hover:bg-[#f8fafc] transition-colors"
            >
              &larr; Placements Directory ({MOCK_PLACEMENTS_DB.length})
            </Link>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#eaecf0] bg-white px-3.5 py-2.5 text-[14px] font-[500] text-[#344054] shadow-xs hover:bg-[#f8fafc] transition-colors"
            >
              <span className="text-[#007aff] font-semibold text-[16px] leading-none">+</span>
              <span>Book New Visit</span>
            </button>
          </div>
        </div>

        {/* Date Selection */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#eaecf0] pb-2">
          {dates.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setSelectedDate(d.value)}
              className={`rounded-[8px] px-3.5 py-2 text-[14px] font-[500] transition-colors ${
                selectedDate === d.value
                  ? "border border-[#007aff] bg-white text-[#007aff] ring-1 ring-[#007aff] shadow-2xs"
                  : "border border-[#eaecf0] bg-white text-[#344054] hover:bg-[#f8fafc]"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

          {/* Left Column: Triage Dispatch Queue Alert & Filters */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <div className="flex flex-col gap-3 rounded-[8px] border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-[14px] font-[500] text-amber-900">
                  Awaiting Dispatch
                </h3>
              </div>
              <p className="text-[12px] text-amber-800 leading-relaxed">
                1 urgent referral is matched but requires a scheduled visit window within 24 hours.
              </p>

              <div className="rounded-[8px] border border-amber-200 bg-white p-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] font-semibold text-[#101828]">
                    REF-9021
                  </span>
                  <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                    URGENT
                  </span>
                </div>
                <div className="mt-1 text-[13px] font-[500] text-[#101828]">
                  Harold Jenkins
                </div>
                <div className="text-[12px] text-[#667085]">
                  Sarah Chen (RN-WCC) assigned
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-3 block w-full text-center rounded-[6px] border border-[#eaecf0] bg-white px-3 py-1.5 text-[12px] font-[500] text-[#344054] shadow-xs hover:bg-[#f8fafc] transition-colors"
                >
                  Confirm Visit Window &rarr;
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            <div className="flex flex-col gap-4 rounded-[8px] border border-[#eaecf0] bg-white p-4 shadow-xs">
              <h3 className="text-[15px] font-[500] text-[#101828]">
                Schedule Filters
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-[500] text-[#344054]">
                  Filter by Clinician
                </label>
                <select
                  value={selectedClinicianId}
                  onChange={(e) => setSelectedClinicianId(e.target.value)}
                  className="rounded-[8px] border border-[#eaecf0] bg-white px-3 py-2 text-[14px] text-[#101828] shadow-xs focus:border-[#007aff] focus:outline-none"
                >
                  <option value="All">All Clinicians</option>
                  {MOCK_CLINICIANS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-[500] text-[#344054]">
                  Visit Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-[8px] border border-[#eaecf0] bg-white px-3 py-2 text-[14px] text-[#101828] shadow-xs focus:border-[#007aff] focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In-Transit">In-Transit</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending Confirmation">Pending Confirmation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Appointment Timeline */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-[500] text-[#101828]">
                Scheduled Appointments ({filteredVisits.length})
              </h2>
              <span className="text-[12px] text-[#667085]">
                Times displayed in Eastern Time (ET)
              </span>
            </div>

            {filteredVisits.length > 0 ? (
              <div className="flex flex-col gap-3">
                {filteredVisits.map((visit) => {
                  const isUrgent = visit.priority === "Urgent";

                  return (
                    <div
                      key={visit.id}
                      className="flex flex-col justify-between gap-4 rounded-[8px] border border-[#eaecf0] bg-white p-5 shadow-xs transition hover:border-[#b2d5ff] sm:flex-row sm:items-center"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[14px] font-semibold text-[#007aff]">
                            {visit.timeSlot}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              visit.status === "Confirmed"
                                ? "bg-[#34c759]/15 text-[#1e7e34]"
                                : visit.status === "In-Transit"
                                ? "bg-[#007aff]/10 text-[#007aff]"
                                : "bg-[#ff9500]/15 text-[#b26a00]"
                            }`}
                          >
                            {visit.status}
                          </span>
                          {isUrgent && (
                            <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                              Urgent
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-[15px] font-[500] text-[#101828]">
                              {visit.patientName}
                            </h3>
                            <Link
                              href={`/referrals/${visit.referralId}`}
                              className="font-mono text-[12px] text-[#007aff] hover:underline"
                            >
                              ({visit.referralId})
                            </Link>
                          </div>
                          <p className="text-[13px] text-[#475467]">
                            {visit.serviceType}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[12px] text-[#667085]">
                          <div>
                            <span className="text-[#344054] font-medium">
                              Provider:
                            </span>{" "}
                            {visit.clinicianName} ({visit.discipline})
                          </div>
                          <div>
                            <span className="text-[#344054] font-medium">
                              Location:
                            </span>{" "}
                            {visit.patientAddress}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Link
                          href={`/referrals/${visit.referralId}`}
                          className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#eaecf0] bg-white px-3.5 py-2 text-[13px] font-[500] text-[#344054] shadow-xs hover:bg-[#f8fafc] transition-colors"
                        >
                          <span>View Triage</span>
                          <span className="text-[#007aff] font-semibold">&rarr;</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[8px] border border-[#eaecf0] bg-white p-12 text-center">
                <p className="text-[14px] font-medium text-[#101828]">
                  No appointments scheduled for this date
                </p>
                <p className="mt-1 text-[13px] text-[#667085]">
                  Try switching to another day in the date carousel above or book a new visit.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      <BookVisitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookVisit={handleBookVisit}
        initialDate={selectedDate}
      />
    </div>
  );
}