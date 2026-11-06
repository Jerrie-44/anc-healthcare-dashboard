// components/application/schedule/book-visit-modal.tsx
"use client";

import { useState } from "react";
import { MOCK_CASES_DB } from "@/lib/referral-service";
import { MOCK_CLINICIANS } from "@/types/clinician";
import { ScheduledVisit } from "@/types/schedule";

interface BookVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookVisit: (visit: ScheduledVisit) => void;
  initialDate: string;
}

export function BookVisitModal({
  isOpen,
  onClose,
  onBookVisit,
  initialDate,
}: BookVisitModalProps) {
  const [patientName, setPatientName] = useState("");
  const [referralId, setReferralId] = useState("");
  const [clinicianId, setClinicianId] = useState(MOCK_CLINICIANS[0]?.id || "");
  const [timeSlot, setTimeSlot] = useState("09:00 AM - 10:00 AM");
  const [date, setDate] = useState(initialDate);
  const [serviceType, setServiceType] = useState("In-Home Clinical Nursing");
  const [patientAddress, setPatientAddress] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clinician = MOCK_CLINICIANS.find((c) => c.id === clinicianId);

    onBookVisit({
      id: `visit-${Date.now()}`,
      timeSlot,
      date,
      patientName: patientName || "Admitted Patient",
      referralId: referralId || "REF-CUSTOM",
      serviceType,
      clinicianId,
      clinicianName: clinician?.name || "Assigned Clinician",
      discipline: clinician?.discipline || "RN",
      patientAddress: patientAddress || "Field Residence",
      status: "Confirmed",
      priority: "Standard", // Aligned with VisitPriority ("Urgent" | "High" | "Standard")
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[8px] border border-[#eaecf0] bg-white p-6 shadow-xl font-['Clash_Grotesk']"
      >
        <h3 className="text-[18px] font-[500] text-[#101828] mb-3">
          Book New Field Visit
        </h3>

        <div className="flex flex-col gap-3 text-[13px]">
          <div>
            <label className="block text-[12px] font-medium text-[#344054] mb-1">
              Patient Name
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Eleanor Vance"
              className="w-full rounded border border-[#d0d5dd] p-2"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#344054] mb-1">
              Referral Case
            </label>
            <select
              value={referralId}
              onChange={(e) => setReferralId(e.target.value)}
              className="w-full rounded border border-[#d0d5dd] p-2 bg-white"
            >
              <option value="">Select a Referral Case</option>
              {MOCK_CASES_DB.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.draftProfile.patientName.value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#344054] mb-1">
              Assigned Clinician
            </label>
            <select
              value={clinicianId}
              onChange={(e) => setClinicianId(e.target.value)}
              className="w-full rounded border border-[#d0d5dd] p-2 bg-white"
            >
              {MOCK_CLINICIANS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.discipline})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[12px] font-medium text-[#344054] mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded border border-[#d0d5dd] p-2"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#344054] mb-1">
                Time Slot
              </label>
              <input
                type="text"
                required
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="09:00 AM - 10:00 AM"
                className="w-full rounded border border-[#d0d5dd] p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#344054] mb-1">
              Patient Address
            </label>
            <input
              type="text"
              required
              value={patientAddress}
              onChange={(e) => setPatientAddress(e.target.value)}
              placeholder="e.g. 4820 Forbes Ave, Apt 4B"
              className="w-full rounded border border-[#d0d5dd] p-2"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t border-[#eaecf0] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] border border-[#eaecf0] px-3.5 py-1.5 text-[13px] text-[#344054]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-[6px] bg-[#007aff] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[#0062cc]"
          >
            Confirm Booking
          </button>
        </div>
      </form>
    </div>
  );
}