// components/application/caregivers/add-caregiver-modal.tsx
"use client";

import { useState } from "react";
import { CaregiverDirectoryRecord, CaregiverQualification } from "@/types/caregiver";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccess: (newCaregiver: CaregiverDirectoryRecord) => void;
}

export function AddCaregiverModal({ isOpen, onClose, onAddSuccess }: Props) {
  const [name, setName] = useState("");
  const [qualification, setQualification] = useState<CaregiverQualification>("Registered Nurse (RN)");
  const [zipCode, setZipCode] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !zipCode) return;

    const newRecord: CaregiverDirectoryRecord = {
      id: `CG-2026-${Math.floor(200 + Math.random() * 800)}`,
      name: name.trim(),
      qualification,
      zipCode: zipCode.trim(),
      serviceArea: serviceArea.trim() || `Greater Pittsburgh (${zipCode.trim()})`,
      availability: "Available",
      screening: "Pending",
      status: "Under Review",
      activeCertifications: ["Credential Verification in Progress"],
      yearsExperience: 1,
      isSmoker: false,
      phone: phone || "(412) 555-0100",
      email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@anc-care.org`,
      joinedDate: new Date().toISOString().substring(0, 10),
    };

    onAddSuccess(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-xs font-sans">
      <div className="w-full max-w-lg rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
          <div>
            <h3 className="text-[18px] font-semibold text-[#101828]">Add Care Giver</h3>
            <p className="text-[13px] text-[#475467] mt-0.5">
              Initiate a new caregiver profile and credential verification record.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#667085] hover:text-[#101828]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-[13px]">
          <div>
            <label className="block font-medium text-[#344054] mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rachel Adams, RN"
              className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#344054] mb-1">
                Professional Qualification *
              </label>
              <select
                value={qualification}
                onChange={(e) => setQualification(e.target.value as CaregiverQualification)}
                className="w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              >
                <option value="Registered Nurse (RN)">Registered Nurse (RN)</option>
                <option value="Home Health Aide (HHA)">Home Health Aide (HHA)</option>
                <option value="Physical Therapist (PT)">Physical Therapist (PT)</option>
                <option value="Occupational Therapist (OT)">Occupational Therapist (OT)</option>
                <option value="Certified Nursing Assistant (CNA)">Certified Nursing Assistant (CNA)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#344054] mb-1">
                Primary ZIP Code *
              </label>
              <input
                type="text"
                required
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="e.g. 15213"
                className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#344054] mb-1">
              Service Area / Coverage Territory
            </label>
            <input
              type="text"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              placeholder="e.g. Pittsburgh East End (Oakland / Shadyside)"
              className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#344054] mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(412) 555-0100"
                className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#344054] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@anc-care.org"
                className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-[#EAECF0]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#D0D5DD] px-4 py-2 font-medium text-[#344054] hover:bg-[#F2F4F7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#007AFF] px-4 py-2 font-semibold text-white shadow-xs hover:bg-[#0062CC]"
            >
              Register Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}