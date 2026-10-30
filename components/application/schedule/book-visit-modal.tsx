// components/application/schedule/book-visit-modal.tsx
"use client";

import { useState } from "react";
import { MOCK_REFERRALS } from "@/types/referral";
import { MOCK_CLINICIANS } from "@/types/clinician";
import { ScheduledVisit } from "@/types/schedule";

interface BookVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookVisit: (newVisit: ScheduledVisit) => void;
  initialDate?: string;
}

const TIME_SLOTS = [
  "08:30 AM - 09:30 AM",
  "10:00 AM - 11:00 AM",
  "11:30 AM - 12:30 PM",
  "01:30 PM - 02:30 PM",
  "03:00 PM - 04:00 PM",
  "04:30 PM - 05:30 PM",
];

export function BookVisitModal({
  isOpen,
  onClose,
  onBookVisit,
  initialDate = "2026-10-30",
}: BookVisitModalProps) {
  const [selectedReferralId, setSelectedReferralId] = useState(
    MOCK_REFERRALS[0]?.id || "REF-9021"
  );
  const [selectedClinicianId, setSelectedClinicianId] = useState(
    MOCK_CLINICIANS[0]?.id || "CLN-104"
  );
  const [visitDate, setVisitDate] = useState(initialDate);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1]);
  const [serviceNotes, setServiceNotes] = useState(
    "Primary wound dressing replacement & clinical vitals assessment."
  );

  if (!isOpen) return null;

  const currentReferral =
    MOCK_REFERRALS.find((r) => r.id === selectedReferralId) || MOCK_REFERRALS[0];
  const currentClinician =
    MOCK_CLINICIANS.find((c) => c.id === selectedClinicianId) || MOCK_CLINICIANS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newVisit: ScheduledVisit = {
      id: `VST-${Math.floor(100 + Math.random() * 900)}`,
      referralId: currentReferral.id,
      patientName: currentReferral.patientName,
      patientAddress: "Springfield Metro, Zone 2",
      clinicianId: currentClinician.id,
      clinicianName: currentClinician.name,
      discipline: currentClinician.discipline,
      serviceType: currentReferral.primaryCondition,
      date: visitDate,
      timeSlot: timeSlot,
      status: "Confirmed",
      priority: currentReferral.priority as "Urgent" | "High" | "Standard",
    };

    onBookVisit(newVisit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-xl rounded-[12px] border border-[#eaecf0] bg-white p-6 shadow-xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#eaecf0] pb-4">
          <div>
            <h2 className="text-display-4-medium tracking-tight text-text-primary">
              Book Field Care Visit
            </h2>
            <p className="mt-1 text-body-2-regular text-text-secondary">
              Assign an available provider and lock in a home health visit window.
            </p>
          </div>
          
          {/* Top-Right "X" - Transparent & No Fill */}
          <button
            type="button"
            onClick={onClose}
            style={{ backgroundColor: "transparent" }}
            className="flex h-8 w-8 items-center justify-center rounded-[8px] border-0 text-[#667085] transition hover:bg-slate-100 hover:text-[#1d2939]"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          
          {/* Referral Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-caption-1-medium text-text-secondary">
              Select Patient Referral Case
            </label>
            <select
              value={selectedReferralId}
              onChange={(e) => setSelectedReferralId(e.target.value)}
              className="rounded-[10px] border border-[#d0d5dd] bg-white px-3.5 py-2 text-body-2-medium text-text-primary focus:border-[#007aff] focus:outline-none"
            >
              {MOCK_REFERRALS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.patientName} ({r.id}) — {r.primaryCondition} [{r.priority}]
                </option>
              ))}
            </select>
          </div>

          {/* Clinician Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-caption-1-medium text-text-secondary">
              Assign Clinician
            </label>
            <select
              value={selectedClinicianId}
              onChange={(e) => setSelectedClinicianId(e.target.value)}
              className="rounded-[10px] border border-[#d0d5dd] bg-white px-3.5 py-2 text-body-2-medium text-text-primary focus:border-[#007aff] focus:outline-none"
            >
              {MOCK_CLINICIANS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.discipline}) &bull; {c.availability}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-caption-1-medium text-text-secondary">
                Visit Date
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="rounded-[10px] border border-[#d0d5dd] bg-white px-3.5 py-2 text-body-2-medium text-text-primary focus:border-[#007aff] focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-caption-1-medium text-text-secondary">
                Time Window
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="rounded-[10px] border border-[#d0d5dd] bg-white px-3.5 py-2 text-body-2-medium text-text-primary focus:border-[#007aff] focus:outline-none"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clinical Instructions */}
          <div className="flex flex-col gap-1.5">
            <label className="text-caption-1-medium text-text-secondary">
              Clinical Instructions / Focus
            </label>
            <textarea
              rows={2}
              value={serviceNotes}
              onChange={(e) => setServiceNotes(e.target.value)}
              placeholder="e.g. Bring specialized dressing kit, patient has mobility restriction..."
              className="rounded-[10px] border border-[#d0d5dd] bg-white p-3 text-body-2-regular text-text-primary focus:border-[#007aff] focus:outline-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="mt-2 flex items-center justify-end gap-3 border-t border-[#eaecf0] pt-4">
            {/* Secondary Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              style={{ backgroundColor: "#ffffff", color: "#344054" }}
              className="rounded-[10px] border border-[#d0d5dd] px-4 py-2.5 text-body-2-medium font-medium shadow-xs transition hover:!bg-[#f9fafb] focus:outline-none"
            >
              Cancel
            </button>
            
            {/* Primary Action Button */}
            <button
              type="submit"
              style={{ backgroundColor: "#007aff", color: "#ffffff" }}
              className="rounded-[10px] px-4 py-2.5 text-body-2-medium font-medium shadow-xs transition hover:opacity-90 focus:outline-none"
            >
              Confirm &amp; Schedule Visit
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}