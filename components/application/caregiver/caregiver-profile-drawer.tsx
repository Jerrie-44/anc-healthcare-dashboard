// components/application/caregiver/caregiver-profile-drawer.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CaregiverDirectoryRecord } from "@/types/caregiver";

interface Props {
  isOpen: boolean;
  caregiver: CaregiverDirectoryRecord | null;
  onClose: () => void;
}

export function CaregiverProfileDrawer({ isOpen, caregiver, onClose }: Props) {
  if (!isOpen || !caregiver) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/40 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl border-l border-[#EAECF0]"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-[#EAECF0] px-6 py-5 bg-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF] font-semibold text-[16px]">
                {caregiver.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <h2 className="text-[18px] font-semibold text-[#101828] leading-tight">
                  {caregiver.name}
                </h2>
                <span className="font-mono text-[12px] text-[#667085]">{caregiver.id}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#667085] hover:bg-[#EAECF0] hover:text-[#101828] transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[13px]">
            <div className="grid grid-cols-3 gap-2.5 rounded-xl border border-[#EAECF0] bg-[#F8FAFC] p-3.5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#667085] block">
                  Availability
                </span>
                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  caregiver.availability === "Available"
                    ? "bg-[#34C759]/15 text-[#248A3D]"
                    : caregiver.availability === "Limited Availability"
                    ? "bg-[#F79009]/15 text-[#B26A00]"
                    : "bg-[#EAECF0] text-[#667085]"
                }`}>
                  {caregiver.availability}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#667085] block">
                  Screening
                </span>
                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  caregiver.screening === "Completed"
                    ? "bg-[#007AFF]/10 text-[#007AFF]"
                    : caregiver.screening === "Needs Review"
                    ? "bg-[#FF3B30]/10 text-[#FF3B30]"
                    : "bg-[#EAECF0] text-[#667085]"
                }`}>
                  {caregiver.screening}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#667085] block">
                  Status
                </span>
                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  caregiver.status === "Active"
                    ? "bg-[#34C759]/15 text-[#248A3D]"
                    : caregiver.status === "On Assignment"
                    ? "bg-[#007AFF]/15 text-[#007AFF]"
                    : caregiver.status === "Under Review"
                    ? "bg-[#F79009]/15 text-[#B26A00]"
                    : "bg-[#EAECF0] text-[#667085]"
                }`}>
                  {caregiver.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[14px] font-semibold text-[#101828]">Professional Profile</h3>
              <div className="space-y-2 rounded-lg border border-[#EAECF0] p-3.5 bg-white">
                <div className="flex justify-between">
                  <span className="text-[#667085]">Discipline</span>
                  <span className="font-semibold text-[#101828]">{caregiver.qualification}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Experience</span>
                  <span className="font-medium text-[#101828]">{caregiver.yearsExperience} Years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Smoking Rule</span>
                  <span className="font-medium text-[#101828]">{caregiver.isSmoker ? "Smoker" : "Non-Smoker Household"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[14px] font-semibold text-[#101828]">Active Certifications</h3>
              <div className="flex flex-wrap gap-1.5">
                {caregiver.activeCertifications.map((cert) => (
                  <span key={cert} className="rounded-md border border-[#D0D5DD] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-medium text-[#344054]">
                    ✓ {cert}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[14px] font-semibold text-[#101828]">Location & Service Territory</h3>
              <div className="space-y-2 rounded-lg border border-[#EAECF0] p-3.5 bg-white">
                <div className="flex justify-between">
                  <span className="text-[#667085]">Primary ZIP</span>
                  <span className="font-mono text-[#101828]">ZIP {caregiver.zipCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Coverage Territory</span>
                  <span className="text-[#101828]">{caregiver.serviceArea}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#EAECF0] p-4 bg-[#F8FAFC] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#D0D5DD] bg-white px-4 py-2 text-[13px] font-medium text-[#344054] hover:bg-[#F2F4F7]"
            >
              Close
            </button>
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
}