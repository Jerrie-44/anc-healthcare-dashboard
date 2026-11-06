// app/(dashboard)/placements/[placementId]/page.tsx
"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { getPlacementById } from "@/lib/placement-service";
import {
  ContactMethod,
  ContactOutcome,
  CaregiverResponseType,
} from "@/types/placement";

interface PageProps {
  params: Promise<{ placementId: string }>;
}

export default function PlacementDetailsWorkspacePage({ params }: PageProps) {
  const { placementId } = use(params);
  const router = useRouter();

  const placement = getPlacementById(placementId);
  if (!placement) notFound();

  // Contact Attempt Form State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("Phone Call");
  const [contactOutcome, setContactOutcome] = useState<ContactOutcome>("Spoke with Caregiver");
  const [contactNotes, setContactNotes] = useState("");

  // Response Form State
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseType, setResponseType] = useState<CaregiverResponseType>("Accepted");
  const [declineReason, setDeclineReason] = useState("");

  // Activation & Completion State
  const [isActivating, setIsActivating] = useState(false);
  const [completionReasonInput, setCompletionReasonInput] = useState("");
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  // Record Contact Attempt
  const handleLogContactAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);

    placement.contacts.unshift({
      id: `cnt-${Date.now()}`,
      placementId: placement.id,
      method: contactMethod,
      timestamp: now,
      contactedBy: "Dr. R. Sterling",
      outcome: contactOutcome,
      notes: contactNotes,
    });

    placement.caregiverResponseStatus = "Contact Pending";
    placement.activityLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      actor: "Dr. R. Sterling",
      action: "Caregiver Contact Attempted",
      details: `${contactMethod} outcome: ${contactOutcome}. Notes: ${contactNotes || "Outreach dispatched."}`,
    });

    setIsContactModalOpen(false);
    setContactNotes("");
  };

  // Record Caregiver Response
  const handleRecordResponse = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);

    placement.responses.unshift({
      id: `rsp-${Date.now()}`,
      placementId: placement.id,
      responseType,
      timestamp: now,
      responseChannel: "Direct Operator Communications",
      declineReason: responseType === "Declined" ? declineReason : undefined,
      recordedBy: "Dr. R. Sterling",
    });

    placement.caregiverResponseStatus = responseType === "Accepted" ? "Accepted" : "Declined";
    if (responseType === "Accepted") {
      placement.lifecycleStatus = "Preparing";
      placement.acceptedAt = now;
      placement.coordinationStatus = "In Progress";
    }

    placement.activityLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      actor: "Dr. R. Sterling",
      action: `Caregiver ${responseType}`,
      details: responseType === "Accepted" ? "Assignment accepted; coordination unlocked." : `Caregiver declined. Reason: ${declineReason}`,
    });

    setIsResponseModalOpen(false);
  };

  // Complete Coordination Task
  const toggleTaskCompletion = (taskId: string) => {
    const task = placement.tasks.find((t) => t.id === taskId);
    if (!task) return;
    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date().toISOString().replace("T", " ").substring(0, 16) : undefined;
    
    const allCompleted = placement.tasks.every((t) => t.isCompleted);
    placement.coordinationStatus = allCompleted ? "Completed" : "In Progress";
  };

  // Activate Placement
  const handleActivatePlacement = () => {
    setIsActivating(true);
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);

    setTimeout(() => {
      placement.lifecycleStatus = "Active";
      placement.serviceStatus = "In Progress";
      placement.activatedBy = "Dr. R. Sterling";
      placement.activatedAt = now;

      placement.activityLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: now,
        actor: "Dr. R. Sterling",
        action: "Placement Activated",
        details: "Activation conditions verified. Home healthcare visits officially active.",
      });

      setIsActivating(false);
    }, 700);
  };

  // Close / Complete Placement
  const handleCompletePlacement = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);

    placement.lifecycleStatus = "Completed";
    placement.serviceStatus = "Completed";
    placement.completedBy = "Dr. R. Sterling";
    placement.completedAt = now;
    placement.completionReason = completionReasonInput;

    placement.activityLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      actor: "Dr. R. Sterling",
      action: "Placement Completed",
      details: `Discharged. Reason: ${completionReasonInput}`,
    });

    setIsCompletionModalOpen(false);
  };

  const isActivationReady =
    placement.caregiverResponseStatus === "Accepted" &&
    placement.tasks.every((t) => t.isCompleted) &&
    placement.lifecycleStatus !== "Active";

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 font-['Clash_Grotesk'] text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-6 lg:px-10">
        
        {/* Top Header Block */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#D0D5DD] pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#667085] mb-1">
              <Link href="/placements" className="hover:text-[#007AFF]">Placements</Link>
              <span>/</span>
              <span className="font-mono text-[#101828]">{placement.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[32px] font-[500] text-[#101828]">{placement.patientName}</h1>
              <span className={`rounded-full px-3 py-0.5 text-[12px] font-medium ${
                placement.lifecycleStatus === "Active" ? "bg-[#34C759]/15 text-[#1E7E34]" : "bg-[#007AFF]/10 text-[#007AFF]"
              }`}>
                {placement.lifecycleStatus}
              </span>
              <span className="rounded-full bg-[#F2F4F7] border border-[#D0D5DD] px-3 py-0.5 text-[12px] font-mono text-[#667085]">
                {placement.caregiverResponseStatus}
              </span>
            </div>
            <p className="mt-1 text-[14px] text-[#667085]">
              Assigned Clinician: <strong className="text-[#101828]">{placement.caregiverName}</strong> ({placement.caregiverDiscipline}) &bull; Linked Case:{" "}
              <Link href={`/referrals/${placement.caseId}`} className="text-[#007AFF] hover:underline font-mono">
                {placement.caseId}
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {placement.caregiverResponseStatus === "Not Contacted" && (
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="rounded-[6px] bg-[#007AFF] px-4 py-2 text-[14px] font-medium text-white hover:bg-[#0066CC] shadow-xs"
              >
                Log Contact Outreach &rarr;
              </button>
            )}

            {placement.caregiverResponseStatus === "Contact Pending" && (
              <button
                type="button"
                onClick={() => setIsResponseModalOpen(true)}
                className="rounded-[6px] bg-[#007AFF] px-4 py-2 text-[14px] font-medium text-white hover:bg-[#0066CC] shadow-xs"
              >
                Record Response &rarr;
              </button>
            )}

            {isActivationReady && (
              <button
                type="button"
                disabled={isActivating}
                onClick={handleActivatePlacement}
                className="rounded-[6px] bg-[#1E7E34] px-4 py-2 text-[14px] font-medium text-white hover:bg-[#166329] shadow-xs"
              >
                {isActivating ? "Activating..." : "Activate Placement &rarr;"}
              </button>
            )}

            {placement.lifecycleStatus === "Active" && (
              <button
                type="button"
                onClick={() => setIsCompletionModalOpen(true)}
                className="rounded-[6px] border border-[#D0D5DD] bg-white px-4 py-2 text-[14px] font-medium text-[#344054] hover:bg-[#F8FAFC]"
              >
                Discharge &amp; Complete
              </button>
            )}
          </div>
        </div>

        {/* Decline Warning & Replacement Action */}
        {placement.caregiverResponseStatus === "Declined" && (
          <div className="rounded-[8px] border border-[#EF4444]/40 bg-[#EF4444]/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <strong className="text-[#EF4444] font-medium block">Caregiver Declined Assignment</strong>
              <p className="text-[13px] text-[#475467]">
                {placement.caregiverName} declined this assignment. Select another recommended clinician to create a linked replacement attempt.
              </p>
            </div>
            <Link
              href={`/referrals/${placement.caseId}`}
              className="rounded-[6px] bg-[#EF4444] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#DC2626] shrink-0"
            >
              Select Replacement Caregiver &rarr;
            </Link>
          </div>
        )}

        {/* 3-Column Workspace Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Main Workflows (2 Spans) */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            
            {/* Outreach & Caregiver Response History */}
            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-3 mb-3">
                <h3 className="text-[18px] font-[500] text-[#101828]">Caregiver Contact &amp; Response History</h3>
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(true)}
                  className="rounded border border-[#eaecf0] bg-white px-2.5 py-1 text-[12px] font-medium text-[#344054] hover:bg-[#F8FAFC]"
                >
                  + Log Contact Attempt
                </button>
              </div>

              {placement.contacts.length === 0 ? (
                <div className="py-6 text-center text-[13px] text-[#667085]">
                  No contact attempts recorded yet. Outreach required before scheduling.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {placement.contacts.map((cnt) => (
                    <div key={cnt.id} className="rounded border border-[#D0D5DD] bg-[#F8FAFC] p-3 text-[13px]">
                      <div className="flex justify-between font-medium text-[#101828]">
                        <span>{cnt.method} &bull; {cnt.outcome}</span>
                        <span className="text-[11px] text-[#667085]">{cnt.timestamp}</span>
                      </div>
                      <div className="text-[12px] text-[#475467] mt-1">{cnt.notes}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coordination Checklist */}
            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-3 mb-3">
                <div>
                  <h3 className="text-[18px] font-[500] text-[#101828]">Assignment Coordination Checklist</h3>
                  <p className="text-[12px] text-[#667085]">
                    All items must be confirmed before placement activation can proceed.
                  </p>
                </div>
                <span className="font-mono text-[12px] text-[#1E7E34]">
                  {placement.tasks.filter((t) => t.isCompleted).length} / {placement.tasks.length} Completed
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {placement.tasks.map((tsk) => (
                  <div
                    key={tsk.id}
                    onClick={() => toggleTaskCompletion(tsk.id)}
                    className={`flex items-start gap-3 rounded border p-3 cursor-pointer transition-colors ${
                      tsk.isCompleted ? "border-[#34C759]/40 bg-[#34C759]/5" : "border-[#D0D5DD] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={tsk.isCompleted}
                      readOnly
                      className="mt-1 rounded text-[#007AFF]"
                    />
                    <div>
                      <div className={`text-[14px] font-medium ${tsk.isCompleted ? "line-through text-[#667085]" : "text-[#101828]"}`}>
                        {tsk.title}
                      </div>
                      <div className="text-[12px] text-[#475467]">{tsk.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (1 Span): Audit Log & Placement Context */}
          <div className="flex flex-col gap-6">
            
            {/* Quick Context Card */}
            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs text-[13px] flex flex-col gap-3">
              <h3 className="text-[16px] font-[500] text-[#101828] border-b border-[#D0D5DD] pb-2">
                Placement Specifications
              </h3>
              <div>
                <span className="text-[#667085] text-[11px] block">Patient / Location</span>
                <strong>{placement.patientName} ({placement.patientZip})</strong>
              </div>
              <div>
                <span className="text-[#667085] text-[11px] block">Authorized Frequency</span>
                <strong>{placement.authorizedHoursPerWeek} hours / week</strong>
              </div>
              <div>
                <span className="text-[#667085] text-[11px] block">Selected Clinician</span>
                <strong>{placement.caregiverName} ({placement.caregiverPhone})</strong>
              </div>
              <div>
                <span className="text-[#667085] text-[11px] block">Placement Creator</span>
                <span>{placement.createdBy} on {placement.createdAt}</span>
              </div>
            </div>

            {/* Placement Audit History */}
            <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs">
              <h3 className="text-[16px] font-[500] text-[#101828] mb-3">Activity &amp; Audit Trail</h3>
              <div className="flex flex-col gap-3 text-[12px]">
                {placement.activityLogs.map((log) => (
                  <div key={log.id} className="border-b border-[#D0D5DD] pb-2 last:border-b-0">
                    <div className="flex justify-between font-medium text-[#101828]">
                      <span>{log.action}</span>
                      <span className="text-[10px] text-[#667085]">{log.timestamp}</span>
                    </div>
                    <div className="text-[#667085]">Actor: {log.actor}</div>
                    <div className="text-[#344054] mt-0.5">{log.details}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Contact Logging Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form onSubmit={handleLogContactAttempt} className="w-full max-w-md rounded-[8px] border border-[#eaecf0] bg-white p-6 shadow-xl">
            <h3 className="text-[18px] font-[500] text-[#101828] mb-3">Log Caregiver Contact Attempt</h3>

            <div className="flex flex-col gap-3 text-[13px]">
              <div>
                <label className="block text-[12px] font-medium text-[#344054] mb-1">Contact Method</label>
                <select
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value as ContactMethod)}
                  className="w-full rounded border border-[#D0D5DD] p-2 bg-white"
                >
                  <option value="Phone Call">Phone Call</option>
                  <option value="SMS Dispatch">SMS Dispatch</option>
                  <option value="Portal Notification">Portal Notification</option>
                  <option value="Email">Email</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#344054] mb-1">Contact Outcome</label>
                <select
                  value={contactOutcome}
                  onChange={(e) => setContactOutcome(e.target.value as ContactOutcome)}
                  className="w-full rounded border border-[#D0D5DD] p-2 bg-white"
                >
                  <option value="Spoke with Caregiver">Spoke with Caregiver</option>
                  <option value="Left Voicemail">Left Voicemail</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Declined on Call">Declined on Call</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#344054] mb-1">Dispatch Notes</label>
                <textarea
                  rows={3}
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  placeholder="Record summary of conversation or callback instructions..."
                  className="w-full rounded border border-[#D0D5DD] p-2"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-[#eaecf0] pt-3">
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="rounded-[6px] border border-[#eaecf0] px-3.5 py-1.5 text-[13px] text-[#344054]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-[6px] bg-[#007AFF] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[#0066CC]"
              >
                Save Contact Attempt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Record Response Modal */}
      {isResponseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form onSubmit={handleRecordResponse} className="w-full max-w-md rounded-[8px] border border-[#eaecf0] bg-white p-6 shadow-xl">
            <h3 className="text-[18px] font-[500] text-[#101828] mb-3">Record Caregiver Response</h3>

            <div className="flex flex-col gap-3 text-[13px]">
              <div>
                <label className="block text-[12px] font-medium text-[#344054] mb-1">Decision</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="responseType"
                      checked={responseType === "Accepted"}
                      onChange={() => setResponseType("Accepted")}
                    />
                    <span>Accepted Assignment</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="responseType"
                      checked={responseType === "Declined"}
                      onChange={() => setResponseType("Declined")}
                    />
                    <span>Declined Assignment</span>
                  </label>
                </div>
              </div>

              {responseType === "Declined" && (
                <div>
                  <label className="block text-[12px] font-medium text-[#344054] mb-1">Reason for Decline *</label>
                  <textarea
                    rows={3}
                    required
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="e.g. Incompatible shift timing, outside primary commute range..."
                    className="w-full rounded border border-[#D0D5DD] p-2"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-[#eaecf0] pt-3">
              <button
                type="button"
                onClick={() => setIsResponseModalOpen(false)}
                className="rounded-[6px] border border-[#eaecf0] px-3.5 py-1.5 text-[13px] text-[#344054]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-[6px] bg-[#007AFF] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[#0066CC]"
              >
                Record Decision
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discharge / Complete Placement Modal */}
      {isCompletionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form onSubmit={handleCompletePlacement} className="w-full max-w-md rounded-[8px] border border-[#eaecf0] bg-white p-6 shadow-xl">
            <h3 className="text-[18px] font-[500] text-[#101828] mb-3">Discharge &amp; Complete Placement</h3>

            <div className="flex flex-col gap-3 text-[13px]">
              <div>
                <label className="block text-[12px] font-medium text-[#344054] mb-1">Discharge / Completion Reason *</label>
                <textarea
                  rows={3}
                  required
                  value={completionReasonInput}
                  onChange={(e) => setCompletionReasonInput(e.target.value)}
                  placeholder="e.g. Care goals successfully attained; patient stepped down to outpatient PT..."
                  className="w-full rounded border border-[#D0D5DD] p-2"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-[#eaecf0] pt-3">
              <button
                type="button"
                onClick={() => setIsCompletionModalOpen(false)}
                className="rounded-[6px] border border-[#eaecf0] px-3.5 py-1.5 text-[13px] text-[#344054]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-[6px] bg-[#101828] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-black"
              >
                Confirm Completion
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}