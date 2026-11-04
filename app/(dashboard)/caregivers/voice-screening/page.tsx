// app/(dashboard)/caregivers/voice-screening/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_SCREENING_SESSIONS } from "@/lib/mock-screening-store";
import { CandidateScreeningSession, ScreeningInvitationStatus } from "@/types/screening";

type FilterTab = "All" | "Pending" | "In Progress" | "Completed" | "Failed" | "Needs Review";

export default function VoiceScreeningSessionsPage() {
  const [sessions, setSessions] = useState<CandidateScreeningSession[]>(MOCK_SCREENING_SESSIONS);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // In-page Invite Candidate Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    role: "Registered Nurse (RN)",
  });
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);

  // Metric Computations
  const metrics = useMemo(() => {
    const total = sessions.length;
    const inProgress = sessions.filter((s) => s.invitationStatus === "In Progress").length;
    const completed = sessions.filter((s) => s.invitationStatus === "Completed").length;
    const needsAttention = sessions.filter(
      (s) => s.invitationStatus === "Failed" || s.invitationStatus === "Expired"
    ).length;
    const needsReview = sessions.filter(
      (s) => s.invitationStatus === "Completed" && !s.reviewDecision
    ).length;

    return { total, inProgress, completed, needsAttention, needsReview };
  }, [sessions]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      let matchesTab = true;
      if (activeTab === "Pending") matchesTab = s.invitationStatus === "Pending" || s.invitationStatus === "Sent";
      else if (activeTab === "In Progress") matchesTab = s.invitationStatus === "In Progress";
      else if (activeTab === "Completed") matchesTab = s.invitationStatus === "Completed";
      else if (activeTab === "Failed") matchesTab = s.invitationStatus === "Failed" || s.invitationStatus === "Expired";
      else if (activeTab === "Needs Review") matchesTab = s.invitationStatus === "Completed" && !s.reviewDecision;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === "" ||
        s.candidateName.toLowerCase().includes(query) ||
        s.candidateId.toLowerCase().includes(query) ||
        s.sessionId.toLowerCase().includes(query);

      const matchesRole = roleFilter === "All" || s.role.includes(roleFilter);

      return matchesTab && matchesSearch && matchesRole;
    });
  }, [sessions, activeTab, searchQuery, roleFilter]);

  const handleCreateInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    const token = `tok_${Math.random().toString(36).substring(2, 9)}`;
    const newSession: CandidateScreeningSession = {
      sessionId: `SES-${Math.floor(1000 + Math.random() * 9000)}`,
      candidateId: `CAN-${Math.floor(100 + Math.random() * 900)}`,
      candidateName: formData.candidateName,
      candidateEmail: formData.candidateEmail,
      candidatePhone: formData.candidatePhone,
      role: formData.role,
      invitationStatus: "Pending",
      dateInvited: new Date().toISOString().split("T")[0],
      outcome: "Pending Evaluation",
      secureToken: token,
      questions: [],
    };

    setSessions([newSession, ...sessions]);
    setGeneratedInviteLink(`${window.location.origin}/screening/${token}`);
  };

  const renderStatusBadge = (status: ScreeningInvitationStatus, reviewDecision?: string) => {
    if (status === "Completed") {
      if (!reviewDecision) {
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#007aff]/10 px-2.5 py-0.5 text-[12px] font-medium text-[#007aff]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#007aff]" />
            Needs Review
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#34c759]/10 px-2.5 py-0.5 text-[12px] font-medium text-[#34c759]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" />
          Completed
        </span>
      );
    }
    if (status === "In Progress") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#007aff]/10 px-2.5 py-0.5 text-[12px] font-medium text-[#007aff]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#007aff] animate-pulse" />
          In Progress
        </span>
      );
    }
    if (status === "Pending" || status === "Sent") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f2f4f7] px-2.5 py-0.5 text-[12px] font-medium text-[#667085]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#98a2b3]" />
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff9500]/10 px-2.5 py-0.5 text-[12px] font-medium text-[#ff9500]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff9500]" />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10 font-['Clash_Grotesk'] text-[#101828]">
        
        {/* Unboxed Header */}
        <div className="flex flex-col justify-between gap-4 py-1 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[36px] font-[500] leading-tight text-[#101828]">
              Voice Screening Sessions
            </h1>
            <p className="mt-1 text-[14px] text-[#667085]">
              Monitor caregiver voice interviews, track session progress and review completed screenings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setGeneratedInviteLink(null);
              setFormData({
                candidateName: "",
                candidateEmail: "",
                candidatePhone: "",
                role: "Registered Nurse (RN)",
              });
              setIsInviteModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#007aff] px-4 py-2.5 text-[14px] font-[500] text-white hover:bg-[#0066cc] transition-colors shrink-0 shadow-xs"
          >
            + Invite Candidate
          </button>
        </div>

        {/* Summary Metrics Row (White Cards) */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-[8px] border border-[#eaecf0] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#667085] uppercase tracking-wider block">
              Total Sessions
            </span>
            <span className="text-[28px] font-[500] text-[#101828] mt-1 block">
              {metrics.total}
            </span>
          </div>

          <div className="rounded-[8px] border border-[#eaecf0] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#667085] uppercase tracking-wider block">
              In Progress
            </span>
            <span className="text-[28px] font-[500] text-[#007aff] mt-1 block">
              {metrics.inProgress}
            </span>
          </div>

          <div className="rounded-[8px] border border-[#eaecf0] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#667085] uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-[28px] font-[500] text-[#34c759] mt-1 block">
              {metrics.completed}
            </span>
          </div>

          <div className="rounded-[8px] border border-[#eaecf0] bg-white p-5 shadow-xs">
            <span className="text-[12px] font-[400] text-[#667085] uppercase tracking-wider block">
              Needs Attention
            </span>
            <span className="text-[28px] font-[500] text-[#ff9500] mt-1 block">
              {metrics.needsAttention}
            </span>
          </div>
        </div>

        {/* Filter Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#eaecf0] pb-2 text-[14px]">
          {(["All", "Pending", "In Progress", "Completed", "Failed", "Needs Review"] as FilterTab[]).map(
            (tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-[6px] px-3 py-1.5 transition-colors text-[14px] ${
                    isActive
                      ? "bg-[#007aff]/10 text-[#007aff] font-[500]"
                      : "text-[#667085] hover:bg-[#eaecf0]/60 hover:text-[#101828] font-[400]"
                  }`}
                >
                  {tab === "All" ? "All Sessions" : tab}
                  {tab === "Needs Review" && metrics.needsReview > 0 && (
                    <span className="ml-1.5 rounded-full bg-[#007aff] px-1.5 py-0.2 text-[10px] text-white">
                      {metrics.needsReview}
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by candidate, ID, or session..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[8px] border border-[#eaecf0] bg-white px-3.5 py-2 pl-9 text-[14px] text-[#101828] shadow-xs focus:border-[#007aff] focus:outline-none"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-[#98a2b3]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#667085]">Profession:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-[8px] border border-[#eaecf0] bg-white px-3 py-2 text-[14px] text-[#344054] shadow-xs focus:outline-none"
            >
              <option value="All">All Disciplines</option>
              <option value="RN">RN (Registered Nurse)</option>
              <option value="LPN">LPN (Licensed Practical Nurse)</option>
              <option value="PT">PT (Physical Therapist)</option>
              <option value="HHA">HHA (Home Health Aide)</option>
              <option value="CNA">CNA (Nursing Assistant)</option>
            </select>
          </div>
        </div>

        {/* Sessions Table (White Container) */}
        <div className="overflow-hidden rounded-[8px] border border-[#eaecf0] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-[#eaecf0] bg-[#f8fafc] text-[12px] text-[#667085]">
                  <th className="py-3 px-4 font-[500]">Candidate</th>
                  <th className="py-3 px-4 font-[500]">Profession</th>
                  <th className="py-3 px-4 font-[500]">Session ID</th>
                  <th className="py-3 px-4 font-[500]">Invited</th>
                  <th className="py-3 px-4 font-[500]">Started</th>
                  <th className="py-3 px-4 font-[500]">Duration</th>
                  <th className="py-3 px-4 font-[500]">Status</th>
                  <th className="py-3 px-4 font-[500] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecf0]">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#667085]">
                      No voice screening sessions found matching the active filters.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr
                      key={session.sessionId}
                      className="hover:bg-[#f8fafc]/80 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/caregivers/voice-screening/${session.sessionId}`}
                          className="font-[500] text-[#101828] hover:text-[#007aff] transition-colors"
                        >
                          {session.candidateName}
                        </Link>
                        <div className="font-mono text-[12px] text-[#667085]">
                          {session.candidateId}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#344054]">
                        {session.role}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[12px] text-[#667085]">
                        {session.sessionId}
                      </td>

                      <td className="py-3.5 px-4 text-[#667085]">
                        {session.dateInvited}
                      </td>

                      <td className="py-3.5 px-4 text-[#667085]">
                        {session.dateStarted || "—"}
                      </td>

                      <td className="py-3.5 px-4 text-[#344054] font-mono text-[12px]">
                        {session.durationSeconds
                          ? `${Math.floor(session.durationSeconds / 60)}m ${session.durationSeconds % 60}s`
                          : "—"}
                      </td>

                      <td className="py-3.5 px-4">
                        {renderStatusBadge(session.invitationStatus, session.reviewDecision)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/caregivers/voice-screening/${session.sessionId}`}
                          className="rounded-[6px] border border-[#eaecf0] bg-white px-3 py-1 text-[12px] font-[500] text-[#344054] hover:bg-[#f8fafc] transition-colors shadow-2xs"
                        >
                          View Session
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Embedded Modal: Invite Candidate */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-[8px] border border-[#eaecf0] bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#eaecf0] pb-3">
              <h2 className="text-[20px] font-[500] text-[#101828]">Invite Candidate for Screening</h2>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-[#667085] hover:text-[#101828]"
              >
                &#x2715;
              </button>
            </div>

            {!generatedInviteLink ? (
              <form onSubmit={handleCreateInvitation} className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#344054]">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Gonzalez"
                    value={formData.candidateName}
                    onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                    className="mt-1 w-full rounded-[6px] border border-[#eaecf0] p-2 text-[14px] text-[#101828] focus:border-[#007aff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#344054]">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="maria.g@providernet.org"
                    value={formData.candidateEmail}
                    onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
                    className="mt-1 w-full rounded-[6px] border border-[#eaecf0] p-2 text-[14px] text-[#101828] focus:border-[#007aff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#344054]">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 000-0000"
                    value={formData.candidatePhone}
                    onChange={(e) => setFormData({ ...formData, candidatePhone: e.target.value })}
                    className="mt-1 w-full rounded-[6px] border border-[#eaecf0] p-2 text-[14px] text-[#101828] focus:border-[#007aff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#344054]">Discipline Category</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1 w-full rounded-[6px] border border-[#eaecf0] p-2 text-[14px] text-[#101828] focus:border-[#007aff] focus:outline-none"
                  >
                    <option value="Registered Nurse (RN)">Registered Nurse (RN)</option>
                    <option value="Wound Care Certified Nurse (RN-WCC)">Wound Care Certified Nurse (RN-WCC)</option>
                    <option value="Physical Therapist (PT)">Physical Therapist (PT)</option>
                    <option value="Licensed Practical Nurse (LPN)">Licensed Practical Nurse (LPN)</option>
                    <option value="Home Health Aide (HHA)">Home Health Aide (HHA)</option>
                    <option value="Certified Nursing Assistant (CNA)">Certified Nursing Assistant (CNA)</option>
                  </select>
                </div>

                <div className="mt-2 flex justify-end gap-2 border-t border-[#eaecf0] pt-4">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="rounded-[6px] border border-[#eaecf0] px-3.5 py-1.5 text-[14px] text-[#344054] hover:bg-[#f2f4f7]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-[6px] bg-[#007aff] px-4 py-1.5 text-[14px] font-medium text-white hover:bg-[#0066cc]"
                  >
                    Generate Secure Link
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <div className="rounded-[6px] border border-[#34c759]/30 bg-[#34c759]/10 p-3 text-[14px] text-[#101828]">
                  Candidate session generated and ready in the table. Provide this link to the candidate:
                </div>

                <div className="rounded-[6px] border border-[#eaecf0] bg-[#f8fafc] p-2.5 font-mono text-[12px] text-[#101828] break-all">
                  {generatedInviteLink}
                </div>

                <div className="mt-2 flex justify-end gap-2 border-t border-[#eaecf0] pt-4">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(generatedInviteLink)}
                    className="rounded-[6px] bg-[#007aff] px-4 py-1.5 text-[14px] font-medium text-white hover:bg-[#0066cc]"
                  >
                    Copy Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="rounded-[6px] border border-[#eaecf0] px-3.5 py-1.5 text-[14px] text-[#344054] hover:bg-[#f2f4f7]"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}