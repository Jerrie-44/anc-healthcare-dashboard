// app/(dashboard)/caregivers/voice-screening/[sessionId]/page.tsx
"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_INTERVIEW_SESSIONS } from "@/lib/interview-service";
import { MOCK_CAREGIVERS_DB } from "@/lib/caregiver-service";
import {
  ExtractedFieldReviewState,
  StructuredInterviewProfile,
} from "@/types/interview-session";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function VoiceScreeningSessionDetailPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const router = useRouter();

  const session = MOCK_INTERVIEW_SESSIONS.find(
    (s) => s.sessionId.toLowerCase() === sessionId.toLowerCase()
  );
  if (!session) notFound();

  const caregiver = MOCK_CAREGIVERS_DB.find((c) => c.id === session.caregiverId);

  // Editable structured outputs state
  const [structured, setStructured] = useState<StructuredInterviewProfile>({
    ...session.structuredData,
  });
  const [operatorNotes, setOperatorNotes] = useState(session.internalReviewNotes || "");
  const [isSyncing, setIsSyncing] = useState(false);
  const [followUpReasonInput, setFollowUpReasonInput] = useState("");
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  const updateFieldState = (
    section: "professionalBackground" | "clinicalBackground" | "preferences" | "logistics" | "availability",
    field: string,
    newValue: any,
    newReviewState: ExtractedFieldReviewState
  ) => {
    setStructured((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: {
          ...prev[section][field],
          value: newValue,
          reviewState: newReviewState,
          lastEditedBy: "Dr. R. Sterling (Clinical Dispatcher)",
          lastEditedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        },
      },
    }));
  };

  const handleCompleteReviewAndSync = () => {
    setIsSyncing(true);

    setTimeout(() => {
      session.reviewStatus = "Reviewed";
      session.reviewedBy = "Dr. R. Sterling (Lead Clinical Dispatcher)";
      session.reviewedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
      session.internalReviewNotes = operatorNotes;
      session.structuredData = structured;

      session.history.unshift({
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        actor: "Dr. R. Sterling",
        action: "Human Audit Cleared",
        notes: "Approved structured fields and committed verified clinical parameters.",
      });

      if (caregiver) {
        caregiver.screening.transcriptSummary = `AI Screening ${session.sessionId} verified by ${session.reviewedBy}.`;
        caregiver.screening.aiExtractedSummary = `${structured.clinicalBackground.primaryDiscipline.value} with ${structured.professionalBackground.yearsExperience.value} years direct care.`;
        caregiver.screening.isConfirmedByOperator = true;
        caregiver.screening.reviewedByInternalStaff = "Dr. R. Sterling";
        caregiver.screening.internalReviewNotes = operatorNotes;

        caregiver.auditHistory.unshift({
          id: `log-s-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          actor: "Dr. R. Sterling",
          action: "Screening Review Synced",
          eventType: "Screening Completed",
          details: `Session ${session.sessionId} verified. Transferred clinical disciplines to master record.`,
        });
      }

      setIsSyncing(false);
      router.push(`/caregivers/${session.caregiverId}`);
    }, 1000);
  };

  const handleCreateFollowUpSession = () => {
    if (!followUpReasonInput) return;
    const newSessionId = `IV-${Math.floor(9020 + Math.random() * 50)}`;

    session.reviewStatus = "Requires Follow-up";
    session.followUpReason = followUpReasonInput;
    session.followUpCreatedSessionId = newSessionId;

    MOCK_INTERVIEW_SESSIONS.unshift({
      sessionId: newSessionId,
      caregiverId: session.caregiverId,
      caregiverName: session.caregiverName,
      interviewType: "Follow-up Clarification",
      questionSetVersion: "ANC-CLARIFICATION-V1",
      sessionStatus: "Interview Required",
      processingStatus: "Not Started",
      reviewStatus: "Awaiting Human Review",
      date: new Date().toISOString().split("T")[0],
      hasAudioRecording: false,
      transcript: [],
      structuredData: { ...structured },
      history: [
        {
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          actor: "Dr. R. Sterling",
          action: "Follow-up Session Triggered",
          notes: `Reason: ${followUpReasonInput}`,
        },
      ],
    });

    setIsFollowUpModalOpen(false);
    alert(`Follow-up session ${newSessionId} generated.`);
  };

  const renderBadge = (state: ExtractedFieldReviewState) => {
    switch (state) {
      case "Human Confirmed":
        return <span className="text-[10px] font-medium text-[#1E7E34] bg-[#34C759]/15 px-1.5 py-0.5 rounded">Human Confirmed</span>;
      case "Human Edited":
        return <span className="text-[10px] font-medium text-[#007AFF] bg-[#007AFF]/10 px-1.5 py-0.5 rounded">Human Edited</span>;
      case "Uncertain":
        return <span className="text-[10px] font-medium text-[#B26A00] bg-[#FF9500]/15 px-1.5 py-0.5 rounded">Uncertain</span>;
      case "Missing":
        return <span className="text-[10px] font-medium text-[#B26A00] bg-[#FF9500]/15 px-1.5 py-0.5 rounded">Missing</span>;
      default:
        return <span className="text-[10px] font-medium text-[#667085] bg-[#F2F4F7] px-1.5 py-0.5 rounded">AI Extracted</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-['Clash_Grotesk'] text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#D0D5DD] pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#667085] mb-1">
              <Link href="/caregivers/voice-screening" className="hover:text-[#007AFF]">AI Voice Interviews</Link>
              <span>/</span>
              <span className="font-mono text-[#101828]">{session.sessionId}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[32px] font-[500] text-[#101828]">{session.caregiverName}</h1>
              <span className="rounded-full bg-[#007AFF]/10 px-3 py-0.5 text-[12px] font-medium text-[#007AFF]">
                {session.interviewType}
              </span>
              <span className="rounded-full bg-[#F2F4F7] border border-[#D0D5DD] px-3 py-0.5 text-[12px] font-mono text-[#667085]">
                {session.reviewStatus}
              </span>
            </div>
            <p className="mt-1 text-[14px] text-[#667085]">
              Session Date: {session.date} &bull; Question Set: {session.questionSetVersion} &bull; Caregiver ID:{" "}
              <Link href={`/caregivers/${session.caregiverId}`} className="text-[#007AFF] hover:underline font-mono">
                {session.caregiverId}
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsFollowUpModalOpen(true)}
              className="rounded-[6px] border border-[#eaecf0] bg-white px-3.5 py-2 text-[14px] font-medium text-[#344054] hover:bg-[#F8FAFC] transition-colors shadow-2xs"
            >
              Request Follow-up Session
            </button>
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleCompleteReviewAndSync}
              className="rounded-[6px] bg-[#007AFF] px-5 py-2 text-[14px] font-medium text-white hover:bg-[#0066CC] disabled:bg-[#D0D5DD] transition-colors shadow-xs"
            >
              {isSyncing ? "Syncing..." : "Confirm & Sync to Profile \u2192"}
            </button>
          </div>
        </div>

        {/* Audio Recording Playback */}
        {session.hasAudioRecording && (
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <div>
                <span className="text-[14px] font-medium text-[#101828] block">Encrypted Call Recording</span>
                <span className="text-[12px] text-[#667085]">Retention policy: 90 days HIPAA compliance storage</span>
              </div>
            </div>
            <audio controls className="h-8 max-w-sm">
              <source src={session.audioRecordingUrl} type="audio/mpeg" />
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        {/* Side-by-Side Review Workspace */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Left Column: Chronological Dialogue Transcript */}
          <div className="flex flex-col gap-3 rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-3">
              <div>
                <h3 className="text-[16px] font-[500] text-[#101828]">Dialogue Transcript</h3>
                <span className="text-[12px] text-[#667085]">Word-for-word conversational speech-to-text transcript</span>
              </div>
              <span className="rounded bg-[#F8FAFC] border border-[#D0D5DD] px-2 py-0.5 font-mono text-[11px] text-[#667085]">
                {session.transcript.length} turns
              </span>
            </div>

            <div className="flex flex-col gap-3.5 max-h-[560px] overflow-y-auto pr-1">
              {session.transcript.map((turn) => {
                const isAI = turn.speaker === "ai-assistant";
                return (
                  <div
                    key={turn.id}
                    className={`rounded-[6px] p-3 text-[13px] leading-relaxed border ${
                      isAI
                        ? "bg-[#F8FAFC] border-[#eaecf0] text-[#344054]"
                        : "bg-white border-[#007AFF]/30 text-[#101828] shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider ${isAI ? "text-[#667085]" : "text-[#007AFF]"}`}>
                        {isAI ? "ANC AI Clinical Interviewer" : "Caregiver"}
                      </span>
                      <span className="text-[10px] text-[#98A2B3]">{turn.timestamp}</span>
                    </div>
                    <div>{turn.messageText}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Structured Entity Review */}
          <div className="flex flex-col gap-4 rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
            <div className="border-b border-[#D0D5DD] pb-3">
              <h3 className="text-[16px] font-[500] text-[#101828]">Structured Entity Extraction</h3>
              <p className="text-[12px] text-[#667085]">
                Verify or edit parsed entities. Approved values sync to the master Caregiver record upon confirmation.
              </p>
            </div>

            <div className="flex flex-col gap-4 max-h-[560px] overflow-y-auto pr-1 text-[13px]">
              
              {/* Primary Discipline */}
              <div className="rounded-[6px] border border-[#eaecf0] p-3 bg-[#F8FAFC]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#101828]">Primary Discipline</span>
                  {renderBadge(structured.clinicalBackground.primaryDiscipline.reviewState)}
                </div>
                <input
                  type="text"
                  value={structured.clinicalBackground.primaryDiscipline.value}
                  onChange={(e) =>
                    updateFieldState("clinicalBackground", "primaryDiscipline", e.target.value, "Human Edited")
                  }
                  className="w-full rounded border border-[#D0D5DD] bg-white p-2 text-[13px] text-[#101828] focus:outline-none focus:border-[#007AFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[6px] border border-[#eaecf0] p-3 bg-[#F8FAFC]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#101828]">Years Direct Care</span>
                    {renderBadge(structured.professionalBackground.yearsExperience.reviewState)}
                  </div>
                  <input
                    type="number"
                    value={structured.professionalBackground.yearsExperience.value}
                    onChange={(e) =>
                      updateFieldState("professionalBackground", "yearsExperience", Number(e.target.value), "Human Edited")
                    }
                    className="w-full rounded border border-[#D0D5DD] bg-white p-2 text-[13px] text-[#101828] focus:outline-none focus:border-[#007AFF]"
                  />
                </div>

                <div className="rounded-[6px] border border-[#eaecf0] p-3 bg-[#F8FAFC]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#101828]">Weekly Hours Capacity</span>
                    {renderBadge(structured.availability.weeklyHoursCapacity.reviewState)}
                  </div>
                  <input
                    type="number"
                    value={structured.availability.weeklyHoursCapacity.value}
                    onChange={(e) =>
                      updateFieldState("availability", "weeklyHoursCapacity", Number(e.target.value), "Human Edited")
                    }
                    className="w-full rounded border border-[#D0D5DD] bg-white p-2 text-[13px] text-[#101828] focus:outline-none focus:border-[#007AFF]"
                  />
                </div>
              </div>

              {/* Travel Radius */}
              <div className="rounded-[6px] border border-[#eaecf0] p-3 bg-[#F8FAFC]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#101828]">Travel Radius (Miles)</span>
                  {renderBadge(structured.logistics.travelRadiusMiles.reviewState)}
                </div>
                <input
                  type="number"
                  value={structured.logistics.travelRadiusMiles.value}
                  onChange={(e) =>
                    updateFieldState("logistics", "travelRadiusMiles", Number(e.target.value), "Human Edited")
                  }
                  className="w-full rounded border border-[#D0D5DD] bg-white p-2 text-[13px] text-[#101828] focus:outline-none focus:border-[#007AFF]"
                />
              </div>

              {/* Operator Audit Notes */}
              <div>
                <label className="block text-[12px] font-medium text-[#344054] mb-1">
                  Operator Audit &amp; Verification Clearance Notes
                </label>
                <textarea
                  rows={3}
                  value={operatorNotes}
                  onChange={(e) => setOperatorNotes(e.target.value)}
                  placeholder="Record verification notes, license cross-checks, or scheduling caveats..."
                  className="w-full rounded-[6px] border border-[#D0D5DD] bg-white p-2 text-[13px] text-[#101828] focus:border-[#007AFF] focus:outline-none"
                />
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* Follow-up Interview Request Modal */}
      {isFollowUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-[8px] border border-[#eaecf0] bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150">
            <h3 className="text-[18px] font-[500] text-[#101828] mb-1">Trigger Follow-up Interview</h3>
            <p className="text-[12px] text-[#667085] mb-4">
              Schedule a supplemental interview session to address incomplete or ambiguous clinical answers.
            </p>

            <label className="block text-[12px] font-medium text-[#344054] mb-1">Reason for Follow-up</label>
            <textarea
              rows={3}
              required
              value={followUpReasonInput}
              onChange={(e) => setFollowUpReasonInput(e.target.value)}
              placeholder="e.g. Session was interrupted during weekly availability section; need to clarify morning coverage."
              className="w-full rounded-[6px] border border-[#D0D5DD] p-2 text-[13px] text-[#101828] focus:outline-none focus:border-[#007AFF]"
            />

            <div className="mt-4 flex justify-end gap-2 border-t border-[#eaecf0] pt-3">
              <button
                type="button"
                onClick={() => setIsFollowUpModalOpen(false)}
                className="rounded-[6px] border border-[#eaecf0] px-3.5 py-1.5 text-[13px] text-[#344054] hover:bg-[#F2F4F7]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!followUpReasonInput}
                onClick={handleCreateFollowUpSession}
                className="rounded-[6px] bg-[#007AFF] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[#0066CC] disabled:bg-[#D0D5DD]"
              >
                Create Follow-up Session &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}