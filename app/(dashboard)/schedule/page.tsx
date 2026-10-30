// app/(dashboard)/schedule/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_SCHEDULED_VISITS, ScheduledVisit } from "@/types/schedule";
import { MOCK_CLINICIANS } from "@/types/clinician";
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
    <div className="flex min-h-screen w-full flex-col bg-[#f8fafc] p-6 lg:p-10 animate-fade-in">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6">

        {/* Breadcrumb */}
        <Breadcrumb aria-label="Schedule Navigation">
          <BreadcrumbItem href="/referrals">Dashboard</BreadcrumbItem>
          <BreadcrumbItem current>Care Schedule & Planner</BreadcrumbItem>
        </Breadcrumb>

        {/* Clean Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center py-2">
          <div>
            <h1 className="text-display-4-medium tracking-tight text-text-primary">
              Field Care Schedule & Routing
            </h1>
            <p className="mt-1 text-body-2-regular text-text-secondary max-w-3xl">
              Coordinate field visit appointments, track clinician dispatch, and eliminate coverage bottlenecks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-[10px] bg-[#007aff] px-4 py-2.5 text-body-2-medium font-medium text-white shadow-xs transition hover:bg-[#0062cc]"
            >
              + Book New Visit
            </button>
          </div>
        </div>

        {/* Date Selection Row */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#eaecf0] pb-2">
          {dates.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setSelectedDate(d.value)}
              className={`rounded-[10px] px-4 py-2 text-body-2-medium transition ${
                selectedDate === d.value
                  ? "bg-[#007aff] text-white shadow-xs"
                  : "bg-white text-text-secondary border border-[#eaecf0] hover:bg-slate-50 hover:text-text-primary"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

          {/* Left Column: Triage Dispatch Queue Alert */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <div className="flex flex-col gap-3 rounded-[10px] border border-amber-200 bg-amber-50/60 p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-body-medium font-semibold text-amber-900">
                  Awaiting Dispatch
                </h3>
              </div>
              <p className="text-caption-1-regular text-amber-800">
                1 urgent referral is matched but requires a scheduled visit window within 24 hours.
              </p>

              <div className="rounded-[8px] border border-amber-200 bg-white p-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-caption-1-bold text-text-primary">
                    REF-9021
                  </span>
                  <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                    URGENT
                  </span>
                </div>
                <div className="mt-1 text-caption-1-medium text-text-primary">
                  Harold Jenkins
                </div>
                <div className="text-caption-2-regular text-text-tertiary">
                  Sarah Chen (RN-WCC) assigned
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-3 block w-full text-center rounded-[8px] bg-amber-600 px-3 py-1.5 text-caption-1-medium font-semibold text-white transition hover:bg-amber-700"
                >
                  Confirm Visit Window &rarr;
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            <div className="flex flex-col gap-4 rounded-[10px] border border-[#eaecf0] bg-white p-4 shadow-xs">
              <h3 className="text-body-medium font-semibold text-text-primary">
                Schedule Filters
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-caption-1-medium text-text-secondary">
                  Filter by Clinician
                </label>
                <select
                  value={selectedClinicianId}
                  onChange={(e) => setSelectedClinicianId(e.target.value)}
                  className="rounded-[10px] border border-[#d0d5dd] bg-white px-3 py-2 text-body-2-medium text-text-primary focus:border-[#007aff] focus:outline-none"
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
                <label className="text-caption-1-medium text-text-secondary">
                  Visit Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-[10px] border border-[#d0d5dd] bg-white px-3 py-2 text-body-2-medium text-text-primary focus:border-[#007aff] focus:outline-none"
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
              <h2 className="text-headline-semibold text-text-primary">
                Scheduled Appointments ({filteredVisits.length})
              </h2>
              <span className="text-caption-1-regular text-text-tertiary">
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
                      className="flex flex-col justify-between gap-4 rounded-[10px] border border-[#eaecf0] bg-white p-5 shadow-xs transition hover:border-[#b2d5ff] sm:flex-row sm:items-center"
                    >
                      <div className="flex flex-col gap-2">
                        {/* Time & Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-body-2-medium font-semibold text-[#007aff]">
                            {visit.timeSlot}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                              visit.status === "Confirmed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : visit.status === "In-Transit"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {visit.status}
                          </span>
                          {isUrgent && (
                            <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                              Urgent
                            </span>
                          )}
                        </div>

                        {/* Patient & Care Details */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-body-medium font-semibold text-text-primary">
                              {visit.patientName}
                            </h3>
                            <Link
                              href={`/referrals/${visit.referralId}`}
                              className="font-mono text-caption-1-regular text-[#007aff] hover:underline"
                            >
                              ({visit.referralId})
                            </Link>
                          </div>
                          <p className="text-body-2-regular text-text-secondary">
                            {visit.serviceType}
                          </p>
                        </div>

                        {/* Provider & Address info */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-caption-1-regular text-text-tertiary">
                          <div>
                            <span className="text-text-secondary font-medium">
                              Provider:
                            </span>{" "}
                            {visit.clinicianName} ({visit.discipline})
                          </div>
                          <div>
                            <span className="text-text-secondary font-medium">
                              Location:
                            </span>{" "}
                            {visit.patientAddress}
                          </div>
                        </div>
                      </div>

                      {/* Visit Action CTA */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Link
                          href={`/referrals/${visit.referralId}`}
                          className="rounded-[10px] border border-[#d0d5dd] bg-white px-3.5 py-1.5 text-body-2-medium text-[#344054] shadow-xs transition hover:bg-[#f9fafb]"
                        >
                          View Triage &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[10px] border border-[#eaecf0] bg-white p-12 text-center animate-fade-in">
                <p className="text-body-medium font-medium text-text-primary">
                  No appointments scheduled for this date
                </p>
                <p className="mt-1 text-body-2-regular text-text-secondary">
                  Try switching to another day in the date carousel above or book a new visit.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Book Visit Modal */}
      <BookVisitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookVisit={handleBookVisit}
        initialDate={selectedDate}
      />
    </div>
  );
}