// app/(dashboard)/caregivers/voice-screening/[sessionId]/page.tsx
"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_SCREENING_SESSIONS } from "@/lib/mock-screening-store";
import { ReviewDecision } from "@/types/screening";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function VoiceScreeningDetailPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const session = MOCK_SCREENING_SESSIONS.find(
    (s) => s.sessionId.toLowerCase() === sessionId.toLowerCase()
  );

  if (!session) {
    notFound();
  }

  // Expanded State for Individual Question Cards
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({
    q1: true,
    q2: true,
    q3: true,
    q4: true,
    q5: true,
  });

  // Decision & Notes State
  const [decision, setDecision] = useState<ReviewDecision | "">(session.reviewDecision || "");
  const [operatorNotes, setOperatorNotes] = useState(session.reviewNotes || "");
  const [isSaved, setIsSaved] = useState(false);

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSaveDecision = () => {
    session.reviewDecision = decision as ReviewDecision;
    session.reviewNotes = operatorNotes;
    session.reviewedBy = "Dr. R. Sterling (Lead Clinical Dispatcher)";
    session.reviewedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <main className="mx-auto my-6 max-w-[1360px] px-6 lg:px-10 font-['Clash_Grotesk'] text-[#101828]">
        <div className="rounded-[8px] border border-[#eaecf0] bg-white p-6 lg:p-9 shadow-xs">
          
          {/* Breadcrumb Navigation */}
          <div className="mb-4 flex items-center gap-2 text-[12px] text-[#667085]">
            <Link href="/caregivers/voice-screening" className="hover:text-[#007aff] transition-colors">
              Voice Screening Sessions
            </Link>
            <span>/</span>
            <span className="text-[#101828]">{session.sessionId}</span>
          </div>

          {/* Header Block */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#eaecf0] pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[36px] font-[500] leading-tight text-[#101828]">
                  {session.candidateName}
                </h1>
                <span className="rounded-full bg-[#007aff]/10 px-3 py-0.5 text-[12px] font-medium text-[#007aff]">
                  {session.role}
                </span>
              </div>
              <p className="mt-1 text-[14px] text-[#667085]">
                Session ID: <span className="font-mono text-[#101828]">{session.sessionId}</span> &bull; 
                Status: <span className="font-medium text-[#101828]">{session.invitationStatus}</span> &bull; 
                Duration: {session.durationSeconds ? `${Math.floor(session.durationSeconds / 60)}m ${session.durationSeconds % 60}s` : "N/A"}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/caregivers/voice-screening"
                className="rounded-[6px] border border-[#eaecf0] bg-white px-3.5 py-2 text-[14px] font-[500] text-[#344054] hover:bg-[#f2f4f7] transition-colors"
              >
                &larr; Back to Sessions
              </Link>
            </div>
          </div>

          {/* 2-Column Split: Clinical Timeline vs Session Metadata & Operator Review */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Left Column (2-spans): AI Summary & Question Transcripts */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              
              {/* AI Summary Observation Banner */}
              {session.assessment ? (
                <div className="rounded-[8px] border border-[#eaecf0] bg-[#f8fafc] p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-[16px] font-[500] text-[#101828]">
                      AI Screening Synthesis
                    </h2>
                    <span className="rounded bg-white px-2 py-0.5 text-[12px] font-medium text-[#007aff] border border-[#eaecf0]">
                      Advisory Recommendation
                    </span>
                  </div>
                  <p className="text-[14px] text-[#344054] leading-relaxed">
                    {session.assessment.summary}
                  </p>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[14px]">
                    <div className="rounded border border-[#eaecf0] bg-white p-3">
                      <span className="text-[12px] text-[#667085] block">Self-Reported Experience</span>
                      <span className="font-medium text-[#101828]">
                        {session.assessment.careExperienceYears} Years Hands-on Care
                      </span>
                    </div>
                    <div className="rounded border border-[#eaecf0] bg-white p-3">
                      <span className="text-[12px] text-[#667085] block">Availability Window</span>
                      <span className="font-medium text-[#101828]">
                        {session.assessment.weeklyAvailability}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-[12px] font-medium text-[#667085] block mb-1">
                      Extracted Competencies &amp; Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {session.assessment.clinicalCompetencies.map((comp) => (
                        <span key={comp} className="rounded-md bg-white border border-[#eaecf0] px-2 py-0.5 text-[12px] text-[#344054]">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {session.assessment.requiresHumanClarification.length > 0 && (
                    <div className="mt-3 rounded border border-[#ff9500]/40 bg-[#ff9500]/10 p-2.5 text-[12px] text-[#101828]">
                      <strong>Flagged for Human Verification:</strong>{" "}
                      {session.assessment.requiresHumanClarification.join("; ")}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-[8px] border border-[#eaecf0] bg-[#f8fafc] p-5 text-[14px] text-[#667085]">
                  Screening is currently awaiting session completion before generating structured synthesis.
                </div>
              )}

              {/* Questions and Responses Transcript List */}
              <div className="rounded-[8px] border border-[#eaecf0] bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[20px] font-[500] text-[#101828]">
                    Interview Transcript ({session.questions.length})
                  </h2>
                  <span className="text-[12px] text-[#667085]">
                    Chronological Conversation Log
                  </span>
                </div>

                {session.questions.length === 0 ? (
                  <div className="py-8 text-center text-[14px] text-[#667085]">
                    {session.invitationStatus === "Failed"
                      ? "Session terminated prior to transcript generation."
                      : "The candidate has not yet initiated the voice interview."}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5">
                    {session.questions.map((q) => {
                      const isExpanded = !!expandedQuestions[q.id];
                      return (
                        <div
                          key={q.id}
                          className="rounded-[6px] border border-[#eaecf0] bg-[#f8fafc]/50 transition-colors"
                        >
                          {/* Question Header Accordion Bar */}
                          <button
                            type="button"
                            onClick={() => toggleQuestion(q.id)}
                            className="flex w-full items-center justify-between p-3.5 text-left text-[14px] hover:bg-[#f2f4f7]/60"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#007aff]">
                                Q{q.questionIndex}:
                              </span>
                              <span className="font-medium text-[#101828]">
                                {q.competencyArea}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[12px] text-[#667085]">
                              <span>{q.durationSeconds}s</span>
                              <span>{isExpanded ? "\u25B2" : "\u25BC"}</span>
                            </div>
                          </button>

                          {/* Collapsible Body */}
                          {isExpanded && (
                            <div className="border-t border-[#eaecf0] p-3.5 space-y-2.5">
                              <div className="text-[12px] text-[#667085]">
                                <strong>Prompt:</strong> {q.questionText}
                              </div>
                              <div className="rounded-[4px] border border-[#eaecf0] bg-white p-3 text-[14px] text-[#344054]">
                                <span className="text-[11px] font-semibold text-[#667085] uppercase block mb-1">
                                  Candidate Voice Response
                                </span>
                                &ldquo;{q.transcript}&rdquo;
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column (1-span): Human Review Desk & Session Metadata */}
            <div className="flex flex-col gap-6">
              
              {/* Operator Review Desk */}
              <div className="rounded-[8px] border border-[#eaecf0] bg-white p-5">
                <h2 className="text-[20px] font-[500] text-[#101828] mb-1">
                  Human Review Desk
                </h2>
                <p className="text-[12px] text-[#667085] mb-4">
                  Record recruiter determinations. AI recommendations require human sign-off.
                </p>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#344054]">
                      Review Determination
                    </label>
                    <select
                      value={decision}
                      onChange={(e) => setDecision(e.target.value as ReviewDecision)}
                      className="mt-1 w-full rounded-[6px] border border-[#eaecf0] p-2 text-[14px] text-[#101828] focus:border-[#007aff] focus:outline-none"
                    >
                      <option value="">-- Select Decision --</option>
                      <option value="Approved for Matching">Approved for Matching</option>
                      <option value="Further Review Required">Further Review Required</option>
                      <option value="Additional Information Required">Additional Information Required</option>
                      <option value="Not Progressing">Not Progressing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#344054]">
                      Reviewer Notes
                    </label>
                    <textarea
                      rows={4}
                      value={operatorNotes}
                      onChange={(e) => setOperatorNotes(e.target.value)}
                      placeholder="Enter clinical notes, license check details, or reason for status update..."
                      className="mt-1 w-full rounded-[6px] border border-[#eaecf0] p-2 text-[14px] text-[#101828] focus:border-[#007aff] focus:outline-none"
                    />
                  </div>

                  {isSaved && (
                    <div className="rounded bg-[#34c759]/10 p-2 text-center text-[12px] font-medium text-[#34c759]">
                      Review decision saved successfully.
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!decision}
                    onClick={handleSaveDecision}
                    className="rounded-[6px] bg-[#007aff] py-2 text-[14px] font-medium text-white hover:bg-[#0066cc] transition-colors disabled:bg-[#eaecf0] disabled:text-[#667085]"
                  >
                    Confirm &amp; Record Decision
                  </button>
                </div>

                {session.reviewedBy && (
                  <div className="mt-4 border-t border-[#eaecf0] pt-3 text-[12px] text-[#667085]">
                    <div>Audited by: <span className="font-medium text-[#101828]">{session.reviewedBy}</span></div>
                    <div>Timestamp: {session.reviewedAt}</div>
                  </div>
                )}
              </div>

              {/* Session Metadata Card */}
              <div className="rounded-[8px] border border-[#eaecf0] bg-white p-5 text-[14px]">
                <h3 className="font-[500] text-[#101828] mb-3">
                  Session Lifecycle Metadata
                </h3>
                <div className="flex flex-col gap-2 text-[12px] text-[#667085]">
                  <div className="flex justify-between border-b border-[#eaecf0] pb-1.5">
                    <span>Candidate ID:</span>
                    <span className="font-mono text-[#101828]">{session.candidateId}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#eaecf0] pb-1.5">
                    <span>Email:</span>
                    <span className="text-[#101828]">{session.candidateEmail}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#eaecf0] pb-1.5">
                    <span>Phone:</span>
                    <span className="text-[#101828]">{session.candidatePhone}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#eaecf0] pb-1.5">
                    <span>Invited Date:</span>
                    <span className="text-[#101828]">{session.dateInvited}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#eaecf0] pb-1.5">
                    <span>Start Timestamp:</span>
                    <span className="text-[#101828]">{session.dateStarted || "Not Started"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion:</span>
                    <span className="text-[#101828]">{session.dateCompleted || "Incomplete"}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}