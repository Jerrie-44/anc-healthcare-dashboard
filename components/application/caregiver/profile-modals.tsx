// components/application/caregiver/profile-modals.tsx
"use client";

import { useState } from "react";
import { 
  CaregiverDirectoryRecord,
  CaregiverQualification,
  AvailabilityStatus,
  CaregiverRecordStatus
} from "@/types/caregiver";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caregiver: CaregiverDirectoryRecord;
  onSave: (updated: CaregiverDirectoryRecord) => void;
}

export function EditProfileModal({ isOpen, onClose, caregiver, onSave }: BaseModalProps) {
  const [name, setName] = useState(caregiver.name);
  const [qualification, setQualification] = useState<CaregiverQualification>(
    caregiver.qualification as CaregiverQualification
  );
  const [phone, setPhone] = useState(caregiver.phone || "");
  const [email, setEmail] = useState(caregiver.email || "");
  const [residentialAddress, setResidentialAddress] = useState(caregiver.residentialAddress || "");
  const [city, setCity] = useState(caregiver.city || "Pittsburgh");
  const [state, setState] = useState(caregiver.state || "PA");
  const [zipCode, setZipCode] = useState(caregiver.zipCode);
  const [serviceArea, setServiceArea] = useState(caregiver.serviceArea);
  const [yearsExperience, setYearsExperience] = useState(caregiver.yearsExperience);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...caregiver,
      name,
      qualification,
      phone,
      email,
      residentialAddress,
      city,
      state,
      zipCode,
      serviceArea,
      yearsExperience: Number(yearsExperience) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-xs font-sans">
      <div className="w-full max-w-xl rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3 mb-4">
          <h3 className="text-[18px] font-semibold text-[#101828]">Edit Caregiver Profile</h3>
          <button type="button" onClick={onClose} className="text-[#667085] hover:text-[#101828]">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
          <div>
            <label className="block font-medium text-[#344054] mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#344054] mb-1">Professional Qualification *</label>
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
              <label className="block font-medium text-[#344054] mb-1">Years of Experience</label>
              <input
                type="number"
                min={0}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#344054] mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#344054] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#344054] mb-1">Street Address</label>
            <input
              type="text"
              value={residentialAddress}
              onChange={(e) => setResidentialAddress(e.target.value)}
              className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-[#344054] mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#344054] mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#344054] mb-1">ZIP Code *</label>
              <input
                type="text"
                required
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#344054] mb-1">Service Area / Coverage Territory</label>
            <input
              type="text"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#EAECF0]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#D0D5DD] px-4 py-2 text-[#344054] hover:bg-[#F2F4F7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#007AFF] px-4 py-2 font-semibold text-white hover:bg-[#0062CC]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UpdateAvailabilityModal({ isOpen, onClose, caregiver, onSave }: BaseModalProps) {
  const [availability, setAvailability] = useState<AvailabilityStatus>(caregiver.availability);
  const [weeklyCapacity, setWeeklyCapacity] = useState(caregiver.weeklyCapacityHours || 35);
  const [schedulingRestrictions, setSchedulingRestrictions] = useState(
    caregiver.schedulingRestrictions || ""
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...caregiver,
      availability,
      weeklyCapacityHours: Number(weeklyCapacity) || 0,
      schedulingRestrictions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-xs font-sans">
      <div className="w-full max-w-md rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3 mb-4">
          <h3 className="text-[18px] font-semibold text-[#101828]">Update Working Availability</h3>
          <button type="button" onClick={onClose} className="text-[#667085] hover:text-[#101828]">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
          <div>
            <label className="block font-medium text-[#344054] mb-1">Availability Status</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
              className="w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
            >
              <option value="Available">Available</option>
              <option value="Limited Availability">Limited Availability</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#344054] mb-1">Weekly Capacity (Hours)</label>
            <input
              type="number"
              min={0}
              max={60}
              value={weeklyCapacity}
              onChange={(e) => setWeeklyCapacity(Number(e.target.value))}
              className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-[#344054] mb-1">Scheduling Restrictions & Notes</label>
            <textarea
              rows={3}
              value={schedulingRestrictions}
              onChange={(e) => setSchedulingRestrictions(e.target.value)}
              placeholder="e.g. Unavailable Friday evenings; prefers daytime cases."
              className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#EAECF0]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#D0D5DD] px-4 py-2 text-[#344054] hover:bg-[#F2F4F7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#007AFF] px-4 py-2 font-semibold text-white hover:bg-[#0062CC]"
            >
              Update Availability
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ReviewScreeningModal({ isOpen, onClose, caregiver, onSave }: BaseModalProps) {
  const currentDetails = caregiver.screeningDetails;
  const [reviewStatus, setReviewStatus] = useState(
    currentDetails?.operatorReviewStatus || "Reviewed & Approved"
  );
  const [reviewNotes, setReviewNotes] = useState(
    currentDetails?.operatorReviewNotes || ""
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
    const updatedScreening = {
      ...(currentDetails || {
        sessionId: "AI-VOICE-SES-NEW",
        completedAt: timestamp,
        strengths: ["Clinical interview recorded"],
        potentialConcerns: [],
        reviewItems: [],
        caregiverPreferences: {
          preferredHours: "Standard Day",
          preferredShifts: ["Mornings"],
          maxCommuteMiles: 15,
          preferredLocations: [caregiver.serviceArea]
        }
      }),
      operatorReviewStatus: reviewStatus as any,
      operatorReviewNotes: reviewNotes,
      operatorReviewedAt: timestamp,
      operatorReviewerName: "Dispatcher Intake Desk",
    };

    onSave({
      ...caregiver,
      screeningDetails: updatedScreening,
      screening: reviewStatus === "Reviewed & Approved" ? "Completed" : "Needs Review",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-xs font-sans">
      <div className="w-full max-w-md rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3 mb-4">
          <h3 className="text-[18px] font-semibold text-[#101828]">Review AI Voice Screening</h3>
          <button type="button" onClick={onClose} className="text-[#667085] hover:text-[#101828]">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
          <div>
            <label className="block font-medium text-[#344054] mb-1">Operator Review Decision</label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value as any)}
              className="w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
            >
              <option value="Reviewed & Approved">Reviewed &amp; Approved</option>
              <option value="Clarification Flagged">Clarification Flagged (Needs Review)</option>
              <option value="Pending Operator Review">Pending Operator Review</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#344054] mb-1">Operator Review Notes</label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Record clinical verification observations or flags..."
              className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#EAECF0]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#D0D5DD] px-4 py-2 text-[#344054] hover:bg-[#F2F4F7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#007AFF] px-4 py-2 font-semibold text-white hover:bg-[#0062CC]"
            >
              Save Review Decision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ChangeStatusModal({ isOpen, onClose, caregiver, onSave }: BaseModalProps) {
  const [status, setStatus] = useState<CaregiverRecordStatus>(caregiver.status);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...caregiver,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-xs font-sans">
      <div className="w-full max-w-md rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3 mb-4">
          <h3 className="text-[18px] font-semibold text-[#101828]">Change Caregiver Status</h3>
          <button type="button" onClick={onClose} className="text-[#667085] hover:text-[#101828]">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
          <div>
            <label className="block font-medium text-[#344054] mb-1">Caregiver Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CaregiverRecordStatus)}
              className="w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-[#101828] focus:border-[#007AFF] focus:outline-none"
            >
              <option value="Active">Active</option>
              <option value="On Assignment">On Assignment</option>
              <option value="Under Review">Under Review</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="rounded-lg border border-[#EAECF0] bg-[#F8FAFC] p-3 text-[12px] text-[#667085]">
            * Note: Status represents overall organizational standing. Availability for scheduling matches is managed independently.
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#EAECF0]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#D0D5DD] px-4 py-2 text-[#344054] hover:bg-[#F2F4F7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#007AFF] px-4 py-2 font-semibold text-white hover:bg-[#0062CC]"
            >
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}