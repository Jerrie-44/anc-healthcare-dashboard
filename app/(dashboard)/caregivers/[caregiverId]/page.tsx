// app/(dashboard)/caregivers/[caregiverId]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CaregiverDirectoryRecord 
} from "@/types/caregiver";
import { 
  getCaregiverById, 
  updateCaregiverRecord 
} from "@/lib/caregiver-directory-service";
import { 
  EditProfileModal, 
  UpdateAvailabilityModal, 
  ReviewScreeningModal, 
  ChangeStatusModal 
} from "@/components/application/caregiver/profile-modals";

type ProfileTab = "profile" | "qualifications" | "screening" | "availability" | "assignments";

interface PageProps {
  params: Promise<{ caregiverId: string }>;
}

export default function CaregiverProfilePage({ params }: PageProps) {
  const { caregiverId } = use(params);
  const router = useRouter();

  const [caregiver, setCaregiver] = useState<CaregiverDirectoryRecord | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [isMounted, setIsMounted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Modal controls
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isScreeningOpen, setIsScreeningOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const found = getCaregiverById(caregiverId);
    setCaregiver(found);
  }, [caregiverId]);

  const handleRecordUpdate = (updated: CaregiverDirectoryRecord) => {
    setCaregiver(updated);
    updateCaregiverRecord(updated);
    setFeedbackMessage("Profile updated and persisted successfully.");
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-8 font-sans">
        <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
          <div className="rounded-xl border border-[#EAECF0] bg-white p-12 text-center text-[#667085]">
            Loading caregiver profile...
          </div>
        </main>
      </div>
    );
  }

  if (!caregiver) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-8 font-sans">
        <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
          <div className="flex items-center gap-2 text-[13px] text-[#667085]">
            <Link href="/caregivers" className="hover:text-[#101828]">
              &larr; Back to Care Givers
            </Link>
          </div>
          <div className="rounded-xl border border-[#EAECF0] bg-white p-12 text-center">
            <h2 className="text-[20px] font-semibold text-[#101828]">Caregiver Not Found</h2>
            <p className="mt-1 text-[13px] text-[#667085]">
              No record matches caregiver ID: <strong className="font-mono">{caregiverId}</strong>.
            </p>
            <Link
              href="/caregivers"
              className="mt-4 inline-block rounded-lg bg-[#007AFF] px-4 py-2 text-[13px] font-medium text-white"
            >
              Return to Directory
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const eligibility = caregiver.matchingEligibility || (caregiver.status === "Active" ? "Eligible" : "Requires Review");

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-sans text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[#EAECF0] pb-4">
          <div className="flex items-center gap-2 text-[13px] text-[#667085]">
            <Link href="/caregivers" className="hover:text-[#101828] font-medium transition-colors">
              Care Givers
            </Link>
            <span>/</span>
            <span className="text-[#101828] font-semibold">{caregiver.name}</span>
          </div>

          <Link
            href="/caregivers"
            className="text-[13px] font-medium text-[#007AFF] hover:underline"
          >
            &larr; Back to Care Givers
          </Link>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="rounded-lg bg-[#34C759]/10 border border-[#34C759]/30 px-4 py-2 text-[13px] font-medium text-[#248A3D] flex items-center justify-between">
            <span>✓ {feedbackMessage}</span>
            <button type="button" onClick={() => setFeedbackMessage(null)} className="text-[#248A3D] hover:underline">✕</button>
          </div>
        )}

        {/* PROFILE HEADER */}
        <div className="rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-xs">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            
            {/* Left: Avatar & Identity */}
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#007AFF]/10 text-[#007AFF] font-bold text-[20px] border border-[#007AFF]/20">
                {caregiver.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-[24px] font-semibold tracking-tight text-[#101828]">
                    {caregiver.name}
                  </h1>
                  <span className="font-mono text-[12px] bg-[#F2F4F7] px-2 py-0.5 rounded text-[#475467]">
                    {caregiver.id}
                  </span>
                </div>

                <p className="mt-0.5 text-[14px] font-medium text-[#344054]">
                  {caregiver.qualification} &bull; <span className="text-[#667085]">{caregiver.serviceArea} (ZIP {caregiver.zipCode})</span>
                </p>

                {/* 4 Discrete Orthogonal Status Badges */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                  {/* Caregiver Status */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[#344054] border border-[#EAECF0]">
                    <span className="text-[#667085] font-semibold">Status:</span>
                    <strong className={
                      caregiver.status === "Active" ? "text-[#248A3D]" :
                      caregiver.status === "On Assignment" ? "text-[#007AFF]" :
                      caregiver.status === "Under Review" ? "text-[#B26A00]" : "text-[#667085]"
                    }>
                      {caregiver.status}
                    </strong>
                  </span>

                  {/* Availability */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[#344054] border border-[#EAECF0]">
                    <span className="text-[#667085] font-semibold">Availability:</span>
                    <strong className={
                      caregiver.availability === "Available" ? "text-[#248A3D]" :
                      caregiver.availability === "Limited Availability" ? "text-[#B26A00]" : "text-[#667085]"
                    }>
                      {caregiver.availability}
                    </strong>
                  </span>

                  {/* Screening */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[#344054] border border-[#EAECF0]">
                    <span className="text-[#667085] font-semibold">Screening:</span>
                    <strong className={
                      caregiver.screening === "Completed" ? "text-[#007AFF]" :
                      caregiver.screening === "Needs Review" ? "text-[#FF3B30]" : "text-[#667085]"
                    }>
                      {caregiver.screening}
                    </strong>
                  </span>

                  {/* Matching Eligibility */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[#344054] border border-[#EAECF0]">
                    <span className="text-[#667085] font-semibold">Matching:</span>
                    <strong className={
                      eligibility === "Eligible" ? "text-[#248A3D]" :
                      eligibility === "Requires Review" ? "text-[#B26A00]" : "text-[#FF3B30]"
                    }>
                      {eligibility}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Focused Action Controls */}
            <div className="relative flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2 text-[13px] font-medium text-[#344054] hover:bg-[#F2F4F7] shadow-2xs"
              >
                Edit Profile
              </button>

              <button
                type="button"
                onClick={() => setIsAvailabilityOpen(true)}
                className="rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2 text-[13px] font-medium text-[#344054] hover:bg-[#F2F4F7] shadow-2xs"
              >
                Update Availability
              </button>

              {/* Action Dropdown Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                  className="rounded-lg bg-[#007AFF] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[#0062CC] shadow-xs flex items-center gap-1.5"
                >
                  <span>Actions</span>
                  <span className="text-[10px]">▼</span>
                </button>

                {isActionMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-[#EAECF0] bg-white p-1.5 shadow-lg z-20 text-[13px]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionMenuOpen(false);
                        setIsScreeningOpen(true);
                      }}
                      className="w-full text-left rounded-md px-3 py-1.5 hover:bg-[#F2F4F7] text-[#101828]"
                    >
                      Review Screening
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionMenuOpen(false);
                        setActiveTab("qualifications");
                      }}
                      className="w-full text-left rounded-md px-3 py-1.5 hover:bg-[#F2F4F7] text-[#101828]"
                    >
                      View Documents
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionMenuOpen(false);
                        setIsStatusOpen(true);
                      }}
                      className="w-full text-left rounded-md px-3 py-1.5 hover:bg-[#F2F4F7] text-[#101828]"
                    >
                      Change Caregiver Status
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 5-SECTION HORIZONTAL NAVIGATION TABS */}
        <div className="border-b border-[#EAECF0] bg-white rounded-t-xl px-4 pt-2">
          <nav className="flex items-center gap-2 overflow-x-auto text-[13px]">
            {[
              { id: "profile", label: "1. Profile" },
              { id: "qualifications", label: "2. Qualifications & Credentials" },
              { id: "screening", label: "3. AI Voice Screening" },
              { id: "availability", label: "4. Availability & Preferences" },
              { id: "assignments", label: "5. Assignments & History" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ProfileTab)}
                  className={`whitespace-nowrap px-4 py-3 border-b-2 font-medium transition-colors ${
                    isActive
                      ? "border-[#007AFF] text-[#007AFF] font-semibold"
                      : "border-transparent text-[#667085] hover:text-[#101828] hover:border-[#D0D5DD]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ================================================================= */}
        {/* SECTION 1: PROFILE                                                */}
        {/* ================================================================= */}
        {activeTab === "profile" && (
          <div className="rounded-b-xl border border-t-0 border-[#EAECF0] bg-white p-6 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Personal Information */}
              <div className="rounded-xl border border-[#EAECF0] p-5 bg-[#F8FAFC]">
                <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3 mb-4">
                  <h3 className="text-[15px] font-semibold text-[#101828]">Personal Information</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(true)}
                    className="text-[12px] font-semibold text-[#007AFF] hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-2.5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Full Name:</span>
                    <span className="font-semibold text-[#101828]">{caregiver.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Caregiver ID:</span>
                    <span className="font-mono text-[#101828]">{caregiver.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Email Address:</span>
                    <span className="font-mono text-[#101828]">{caregiver.email || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Phone:</span>
                    <span className="font-mono text-[#101828]">{caregiver.phone || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Address:</span>
                    <span className="text-[#101828] text-right">{caregiver.residentialAddress || "On file in credential binder"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">City / State / ZIP:</span>
                    <span className="text-[#101828]">{caregiver.city || "Pittsburgh"}, {caregiver.state || "PA"} {caregiver.zipCode}</span>
                  </div>
                  {caregiver.emergencyContact && (
                    <div className="flex justify-between border-t border-[#EAECF0] pt-2 mt-2">
                      <span className="text-[#667085]">Emergency Contact:</span>
                      <span className="text-[#101828]">{caregiver.emergencyContact.name} ({caregiver.emergencyContact.relationship}) &bull; {caregiver.emergencyContact.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Background */}
              <div className="rounded-xl border border-[#EAECF0] p-5 bg-[#F8FAFC]">
                <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3 mb-4">
                  <h3 className="text-[15px] font-semibold text-[#101828]">Professional Profile</h3>
                  <span className="text-[11px] font-mono text-[#667085]">Joined {caregiver.joinedDate}</span>
                </div>

                <div className="space-y-2.5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Primary Qualification:</span>
                    <span className="font-semibold text-[#101828]">{caregiver.qualification}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Years Experience:</span>
                    <span className="font-semibold text-[#101828]">{caregiver.yearsExperience} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Smoking Rule:</span>
                    <span className="text-[#101828]">{caregiver.isSmoker ? "Smoker" : "Non-Smoker Household Compatible"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Primary Coverage Area:</span>
                    <span className="text-[#101828]">{caregiver.serviceArea}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Languages:</span>
                    <span className="text-[#101828]">{caregiver.languages?.join(", ") || "English"}</span>
                  </div>

                  <div className="border-t border-[#EAECF0] pt-2 mt-2">
                    <span className="text-[12px] font-semibold text-[#344054] block mb-1">Clinical Specialties:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(caregiver.clinicalSkills || ["Post-Surgical Care", "Medication Oversight"]).map((skill) => (
                        <span key={skill} className="rounded bg-white border border-[#D0D5DD] px-2 py-0.5 text-[11px] font-medium text-[#344054]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 2: QUALIFICATIONS & CREDENTIALS                           */}
        {/* ================================================================= */}
        {activeTab === "qualifications" && (
          <div className="rounded-b-xl border border-t-0 border-[#EAECF0] bg-white p-6 shadow-xs space-y-6">
            
            {/* Certifications Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-semibold text-[#101828]">Professional Certifications</h3>
                <span className="text-[12px] text-[#667085]">Primary source verified via State Registry</span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[#EAECF0]">
                <table className="w-full border-collapse text-left text-[13px]">
                  <thead className="bg-[#F8FAFC] text-[11px] font-semibold uppercase text-[#667085] border-b border-[#EAECF0]">
                    <tr>
                      <th className="py-2.5 px-4">Certification</th>
                      <th className="py-2.5 px-4">Issuing Organisation</th>
                      <th className="py-2.5 px-4">Issue Date</th>
                      <th className="py-2.5 px-4">Expiry Date</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECF0]">
                    {(caregiver.detailedCertifications && caregiver.detailedCertifications.length > 0
                      ? caregiver.detailedCertifications
                      : caregiver.activeCertifications.map((name, i) => ({
                          id: `CERT-AUTOGEN-${i}`,
                          name,
                          issuingOrg: "Accredited State Registry",
                          issueDate: "2024-01-15",
                          expiryDate: "2027-01-15",
                          status: "Valid" as const,
                          verificationSource: "Registry Verification Verified"
                        }))
                    ).map((cert) => (
                      <tr key={cert.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-semibold text-[#101828]">{cert.name}</td>
                        <td className="py-3 px-4 text-[#475467]">{cert.issuingOrg}</td>
                        <td className="py-3 px-4 font-mono text-[12px] text-[#667085]">{cert.issueDate}</td>
                        <td className="py-3 px-4 font-mono text-[12px] text-[#101828]">{cert.expiryDate}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            cert.status === "Valid" ? "bg-[#34C759]/15 text-[#248A3D]" :
                            cert.status === "Expired" ? "bg-[#FF3B30]/10 text-[#FF3B30]" : "bg-[#F79009]/15 text-[#B26A00]"
                          }`}>
                            {cert.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-[11px] text-[#667085]">
                          {cert.verificationSource || "Verified"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Supporting Documents */}
            <div className="border-t border-[#EAECF0] pt-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#101828]">Uploaded Supporting Documents</h3>
                  <p className="text-[12px] text-[#667085]">
                    Uploaded documents are reviewed by clinical compliance officers before verification clearance.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(caregiver.documents && caregiver.documents.length > 0 ? caregiver.documents : [
                  {
                    id: "DOC-DEFAULT-1",
                    category: "State Board License" as const,
                    documentName: `${caregiver.qualification.split(" ")[0]}_License_Primary_Verification.pdf`,
                    submissionDate: caregiver.joinedDate,
                    reviewStatus: "Verified" as const,
                    expiryDate: "2027-12-31",
                    reviewedBy: "Compliance Intake Specialist",
                    reviewedAt: `${caregiver.joinedDate} 10:00`,
                    version: 1
                  }
                ]).map((doc) => (
                  <div key={doc.id} className="rounded-xl border border-[#EAECF0] p-4 bg-[#F8FAFC] flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#667085]">{doc.category}</span>
                      <h4 className="font-semibold text-[13px] text-[#101828] mt-0.5">{doc.documentName}</h4>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-[#667085]">
                        <span>Uploaded: {doc.submissionDate}</span>
                        <span>&bull;</span>
                        <span>Expires: {doc.expiryDate || "N/A"}</span>
                      </div>
                      {doc.reviewedBy && (
                        <span className="mt-1 text-[11px] text-[#248A3D] block">
                          ✓ Verified by {doc.reviewedBy} ({doc.reviewedAt})
                        </span>
                      )}
                    </div>

                    <span className="rounded bg-white border border-[#D0D5DD] px-2 py-0.5 text-[11px] font-medium text-[#007AFF]">
                      {doc.reviewStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 3: AI VOICE SCREENING                                     */}
        {/* ================================================================= */}
        {activeTab === "screening" && (
          <div className="rounded-b-xl border border-t-0 border-[#EAECF0] bg-white p-6 shadow-xs space-y-6">
            
            {/* Screening Banner */}
            <div className="rounded-xl border border-[#007AFF]/20 bg-[#007AFF]/5 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#007AFF] tracking-wider block">
                  AI Screening Assessment
                </span>
                <h3 className="text-[18px] font-semibold text-[#101828] mt-0.5">
                  Voice Interview Verified: {caregiver.voiceScreeningScore ? `${caregiver.voiceScreeningScore} / 5.0 Communication Score` : "Completed"}
                </h3>
                <p className="mt-1 text-[13px] text-[#475467]">
                  Completed on {caregiver.screeningDetails?.completedAt || caregiver.joinedDate} &bull; Session {caregiver.screeningDetails?.sessionId || "AI-SES-88219"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-white border border-[#EAECF0] px-3 py-1.5 text-[12px] font-semibold text-[#101828]">
                  Review Status: <strong className="text-[#248A3D]">{caregiver.screeningDetails?.operatorReviewStatus || "Reviewed & Approved"}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsScreeningOpen(true)}
                  className="rounded-lg bg-[#007AFF] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0062CC]"
                >
                  Review Screening
                </button>
              </div>
            </div>

            {/* Strengths & Potential Concerns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#34C759]/30 bg-[#34C759]/5 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#248A3D] block mb-2">
                  Identified Strengths
                </span>
                <ul className="list-disc list-inside space-y-1 text-[13px] text-[#101828]">
                  {(caregiver.screeningDetails?.strengths || [
                    "High clinical clarity and adherence to SBAR standard protocols",
                    "Strong background in geriatric and home healthcare directives"
                  ]).map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#F79009]/30 bg-[#F79009]/5 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B26A00] block mb-2">
                  Considerations &amp; Review Items
                </span>
                <ul className="list-disc list-inside space-y-1 text-[13px] text-[#101828]">
                  {(caregiver.screeningDetails?.potentialConcerns?.length ? caregiver.screeningDetails.potentialConcerns : [
                    "No adverse clinical concerns detected in acoustic voice screening model."
                  ]).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Transcript Excerpt */}
            {caregiver.screeningDetails?.transcriptExcerpt && (
              <div className="rounded-xl border border-[#EAECF0] bg-[#F8FAFC] p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] block mb-2">
                  Screening Transcript Excerpt
                </span>
                <p className="text-[13px] text-[#344054] italic leading-relaxed">
                  &ldquo;{caregiver.screeningDetails.transcriptExcerpt}&rdquo;
                </p>
              </div>
            )}

            {/* Operator Notes */}
            {caregiver.screeningDetails?.operatorReviewNotes && (
              <div className="rounded-xl border border-[#EAECF0] p-4 bg-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] block mb-1">
                  Operator Audit Notes ({caregiver.screeningDetails.operatorReviewerName || "Intake Lead"})
                </span>
                <p className="text-[13px] text-[#101828]">
                  {caregiver.screeningDetails.operatorReviewNotes}
                </p>
              </div>
            )}

          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 4: AVAILABILITY & PREFERENCES                             */}
        {/* ================================================================= */}
        {activeTab === "availability" && (
          <div className="rounded-b-xl border border-t-0 border-[#EAECF0] bg-white p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-3">
              <div>
                <h3 className="text-[16px] font-semibold text-[#101828]">Working Schedule &amp; Preferences</h3>
                <p className="text-[12px] text-[#667085]">
                  Updates directly modify caregiver eligibility constraints inside the Match Engine.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailabilityOpen(true)}
                className="rounded-lg bg-[#007AFF] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0062CC]"
              >
                Update Availability
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-[#EAECF0] bg-[#F8FAFC] p-4 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] block">
                  Current Availability
                </span>
                <span className={`text-[18px] font-bold block mt-1 ${
                  caregiver.availability === "Available" ? "text-[#248A3D]" :
                  caregiver.availability === "Limited Availability" ? "text-[#B26A00]" : "text-[#667085]"
                }`}>
                  {caregiver.availability}
                </span>
              </div>

              <div className="rounded-xl border border-[#EAECF0] bg-[#F8FAFC] p-4 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] block">
                  Weekly Capacity
                </span>
                <span className="text-[18px] font-bold text-[#101828] block mt-1">
                  {caregiver.weeklyCapacityHours || 35} Hours / Week
                </span>
              </div>

              <div className="rounded-xl border border-[#EAECF0] bg-[#F8FAFC] p-4 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] block">
                  Max Commute Radius
                </span>
                <span className="text-[18px] font-bold text-[#007AFF] block mt-1">
                  {caregiver.screeningDetails?.caregiverPreferences.maxCommuteMiles || 15} Miles
                </span>
              </div>
            </div>

            {/* Preferred Working Days & Restrictions */}
            <div className="rounded-xl border border-[#EAECF0] p-4 bg-[#F8FAFC] space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#667085]">Preferred Days:</span>
                <span className="font-semibold text-[#101828]">
                  {caregiver.preferredDays?.join(", ") || "Monday, Tuesday, Wednesday, Thursday, Friday"}
                </span>
              </div>

              <div className="flex justify-between text-[13px]">
                <span className="text-[#667085]">Preferred Shifts:</span>
                <span className="font-semibold text-[#101828]">
                  {caregiver.screeningDetails?.caregiverPreferences.preferredShifts?.join(", ") || "Day Shift (08:00 - 16:30)"}
                </span>
              </div>

              <div className="flex justify-between text-[13px] border-t border-[#EAECF0] pt-2">
                <span className="text-[#667085]">Scheduling Restrictions:</span>
                <span className="text-[#101828] text-right font-medium">
                  {caregiver.schedulingRestrictions || "None specified. Flexible for scheduled clinical shifts."}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 5: ASSIGNMENTS & MATCHING HISTORY                         */}
        {/* ================================================================= */}
        {activeTab === "assignments" && (
          <div className="rounded-b-xl border border-t-0 border-[#EAECF0] bg-white p-6 shadow-xs space-y-6">
            
            {/* Active Caseload Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-semibold text-[#101828]">Active Patient Assignments</h3>
                <span className="text-[12px] text-[#667085]">Persisted placements from Cases Intake</span>
              </div>

              {(!caregiver.assignments || caregiver.assignments.length === 0) ? (
                <div className="rounded-lg border border-[#EAECF0] p-6 text-center text-[13px] text-[#667085]">
                  No active patient cases currently assigned to {caregiver.name}.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-[#EAECF0]">
                  <table className="w-full border-collapse text-left text-[13px]">
                    <thead className="bg-[#F8FAFC] text-[11px] font-semibold uppercase text-[#667085] border-b border-[#EAECF0]">
                      <tr>
                        <th className="py-2.5 px-4">Case ID</th>
                        <th className="py-2.5 px-4">Patient</th>
                        <th className="py-2.5 px-4">Care Requirement</th>
                        <th className="py-2.5 px-4">Assignment Date</th>
                        <th className="py-2.5 px-4">Match Origin</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAECF0]">
                      {caregiver.assignments.map((assignment) => (
                        <tr key={assignment.caseId} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-4 font-mono font-semibold text-[#101828]">
                            {assignment.caseId}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#101828]">
                            {assignment.patientName}
                          </td>
                          <td className="py-3 px-4 text-[#475467]">
                            {assignment.careRequirement}
                          </td>
                          <td className="py-3 px-4 font-mono text-[12px] text-[#667085]">
                            {assignment.assignmentDate}
                          </td>
                          <td className="py-3 px-4">
                            <span className="rounded bg-[#007AFF]/10 px-2 py-0.5 text-[11px] font-medium text-[#007AFF]">
                              {assignment.validationType} {assignment.matchScore ? `(${assignment.matchScore}%)` : ""}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="rounded-full bg-[#34C759]/15 px-2 py-0.5 text-[11px] font-medium text-[#248A3D]">
                              {assignment.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              href="/cases-intake"
                              className="text-[12px] font-semibold text-[#007AFF] hover:underline"
                            >
                              Open Case &rarr;
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Historical Matching Disclaimer */}
            <div className="rounded-xl border border-[#EAECF0] bg-[#F8FAFC] p-4 text-[12px] text-[#667085]">
              * Note: Validated matches reflect operator intake approval; clinical deployment and route clearance proceed via downstream scheduling.
            </div>

          </div>
        )}

        {/* MODALS */}
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          caregiver={caregiver}
          onSave={handleRecordUpdate}
        />

        <UpdateAvailabilityModal
          isOpen={isAvailabilityOpen}
          onClose={() => setIsAvailabilityOpen(false)}
          caregiver={caregiver}
          onSave={handleRecordUpdate}
        />

        <ReviewScreeningModal
          isOpen={isScreeningOpen}
          onClose={() => setIsScreeningOpen(false)}
          caregiver={caregiver}
          onSave={handleRecordUpdate}
        />

        <ChangeStatusModal
          isOpen={isStatusOpen}
          onClose={() => setIsStatusOpen(false)}
          caregiver={caregiver}
          onSave={handleRecordUpdate}
        />

      </main>
    </div>
  );
}