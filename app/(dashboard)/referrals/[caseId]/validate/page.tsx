// app/(dashboard)/referrals/[caseId]/validate/page.tsx
"use client";

import { use, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_CASES_DB, executeDeterministicMatching } from "@/lib/referral-service";
import { DayOfWeek, TimeWindow, FieldVerificationState } from "@/types/referral";

interface PageProps {
  params: Promise<{ caseId: string }>;
}

const ALL_DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ALL_WINDOWS: TimeWindow[] = [
  "Morning (08:00 - 12:00)",
  "Afternoon (12:00 - 17:00)",
  "Evening (17:00 - 21:00)",
  "Flexible",
];

export default function CaseValidationDeskPage({ params }: PageProps) {
  const { caseId } = use(params);
  const router = useRouter();

  const caseRecord = MOCK_CASES_DB.find((c) => c.id.toLowerCase() === caseId.toLowerCase());
  if (!caseRecord) notFound();

  // Clinical profile state
  const [patientName, setPatientName] = useState(caseRecord.draftProfile.patientName.value);
  const [zipCode, setZipCode] = useState(caseRecord.draftProfile.zipCode.value);
  const [discipline, setDiscipline] = useState(caseRecord.draftProfile.careDisciplineRequired.value);
  const [hours, setHours] = useState(caseRecord.draftProfile.authorizedHoursPerWeek.value);
  const [clinicalNotes, setClinicalNotes] = useState(caseRecord.draftProfile.clinicalNotesSummary.value);

  // Structured Care Schedule Requirements State
  const [startDate, setStartDate] = useState(caseRecord.draftProfile.schedule.startDate.value);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(caseRecord.draftProfile.schedule.requiredDays.value);
  const [selectedWindows, setSelectedWindows] = useState<TimeWindow[]>(caseRecord.draftProfile.schedule.timeWindows.value);
  const [recurringType, setRecurringType] = useState(caseRecord.draftProfile.schedule.recurringType.value);
  const [timeZone, setTimeZone] = useState(caseRecord.draftProfile.schedule.careTimeZone.value);
  const [scheduleConstraints, setScheduleConstraints] = useState(caseRecord.draftProfile.schedule.schedulingConstraints.value);

  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleWindow = (win: TimeWindow) => {
    setSelectedWindows((prev) =>
      prev.includes(win) ? prev.filter((w) => w !== win) : [...prev, win]
    );
  };

  const handleValidateAndInitiateMatching = () => {
    setIsSubmitting(true);
    const now = new Date().toISOString().replace("T", " ").substring(0, 16);

    // Update Case Profile Draft and promote to Validated Version
    const newVersion = (caseRecord.validatedProfileVersion || 0) + 1;

    caseRecord.draftProfile.patientName = { value: patientName, state: "Human Confirmed", lastEditedBy: "Dr. R. Sterling", lastEditedAt: now };
    caseRecord.draftProfile.zipCode = { value: zipCode, state: "Human Confirmed", lastEditedBy: "Dr. R. Sterling", lastEditedAt: now };
    caseRecord.draftProfile.careDisciplineRequired = { value: discipline, state: "Human Confirmed", lastEditedBy: "Dr. R. Sterling", lastEditedAt: now };
    caseRecord.draftProfile.authorizedHoursPerWeek = { value: Number(hours), state: "Human Confirmed", lastEditedBy: "Dr. R. Sterling", lastEditedAt: now };
    caseRecord.draftProfile.clinicalNotesSummary = { value: clinicalNotes, state: "Human Confirmed", lastEditedBy: "Dr. R. Sterling", lastEditedAt: now };

    caseRecord.draftProfile.schedule = {
      startDate: { value: startDate, state: "Human Confirmed", lastEditedBy: "Dr. R. Sterling", lastEditedAt: now },
      requiredDays: { value: selectedDays, state: "Human Confirmed", lastEditedBy: "Dr. R. Sterling", lastEditedAt: now },
      timeWindows: { value: selectedWindows, state: "Human Confirmed", lastEditedBy: "Dr. R. Sterling", lastEditedAt: now },
      hoursPerWeek: { value: Number(hours), state: "Human Confirmed", lastEditedBy: "Dr. R. Sterling", lastEditedAt: now },
      recurringType: { value: recurringType, state: "Human Confirmed", lastEditedBy: "Dr. R. Sterling", lastEditedAt: now },
      careTimeZone: { value: timeZone, state: "Human Confirmed", lastEditedBy: "Dr. R. Sterling", lastEditedAt: now },
      schedulingConstraints: { value: scheduleConstraints, state: "Human Confirmed", lastEditedBy: "Dr. R. Sterling", lastEditedAt: now },
      sourceDocumentRef: caseRecord.sourceDocuments[0]?.fileName || "Intake Source",
    };

    caseRecord.validatedProfileVersion = newVersion;
    caseRecord.validationStatus = "Validated";
    caseRecord.schedulingStatus = selectedDays.length > 0 ? "Confirmed" : "Incomplete";
    caseRecord.validatedBy = "Dr. R. Sterling";
    caseRecord.validatedAt = now;

    // Archive snapshot in profile history
    caseRecord.validatedProfileHistory.unshift({
      version: newVersion,
      profile: JSON.parse(JSON.stringify(caseRecord.draftProfile)),
      validatedBy: "Dr. R. Sterling",
      validatedAt: now,
    });

    // Automatically initiate deterministic matching against caregiver schedule availability
    caseRecord.matchingStatus = "In Progress";
    setTimeout(() => {
      const recs = executeDeterministicMatching(caseRecord);
      caseRecord.recommendations = recs;
      caseRecord.matchingStatus = "Recommendations Ready";

      caseRecord.activityLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: now,
        actor: "Dr. R. Sterling",
        action: `Profile v${newVersion} Validated & Schedule-Aware Matching Completed`,
        details: `Confirmed ${selectedDays.length} care days (${selectedDays.join(", ")}). Matching returned ${recs.length} candidates.`,
      });

      setIsSubmitting(false);
      router.push(`/referrals/${caseRecord.id}`);
    }, 700);
  };

  const activeDoc = caseRecord.sourceDocuments[activeDocIndex] || caseRecord.sourceDocuments[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 font-['Clash_Grotesk'] text-[#101828]">
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-6">
        
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-3 border-b border-[#D0D5DD] pb-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#667085] mb-1">
              <Link href="/referrals" className="hover:text-[#007AFF]">Cases &amp; Referrals</Link>
              <span>/</span>
              <span className="font-mono text-[#101828]">{caseRecord.id}</span>
              <span>/</span>
              <span>Human Validation &amp; Care Schedule Workspace</span>
            </div>
            <h1 className="text-[28px] font-[500] leading-tight text-[#101828]">
              Validate Case &amp; Schedule Requirements
            </h1>
            <p className="text-[13px] text-[#667085]">
              Verify clinical directives and confirm patient care schedule windows before deterministic matching executes.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/referrals/${caseRecord.id}`}
              className="rounded-[6px] border border-[#D0D5DD] bg-white px-3.5 py-2 text-[13px] font-medium text-[#344054] hover:bg-[#F8FAFC]"
            >
              Cancel &amp; Return
            </Link>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleValidateAndInitiateMatching}
              className="rounded-[6px] bg-[#007AFF] px-5 py-2 text-[13px] font-medium text-white shadow-xs hover:bg-[#0066CC] disabled:bg-[#D0D5DD] transition-colors"
            >
              {isSubmitting ? "Executing Deterministic Matching..." : "Confirm Validation & Run Matching \u2192"}
            </button>
          </div>
        </div>

        {/* 2-Column Split-Screen Validation Desk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Left Column: Original Source Documents View */}
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-3">
              <div>
                <h2 className="text-[16px] font-[500] text-[#101828]">Original Source Intake Document</h2>
                <span className="text-[12px] text-[#667085]">
                  Source: {caseRecord.referralSource} &bull; Received: {caseRecord.dateReceived}
                </span>
              </div>
              <span className="font-mono text-[11px] bg-[#F8FAFC] border border-[#D0D5DD] px-2 py-0.5 rounded text-[#475467]">
                {caseRecord.sourceDocuments.length} Document(s)
              </span>
            </div>

            {/* Document Selector Pills if multiple files attached */}
            {caseRecord.sourceDocuments.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {caseRecord.sourceDocuments.map((doc, idx) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setActiveDocIndex(idx)}
                    className={`rounded-[6px] px-3 py-1 text-[12px] font-medium transition-colors ${
                      activeDocIndex === idx
                        ? "bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]"
                        : "bg-[#F8FAFC] border border-[#D0D5DD] text-[#344054]"
                    }`}
                  >
                    {doc.fileName}
                  </button>
                ))}
              </div>
            )}

            {/* Document Content View */}
            <div className="rounded-[6px] border border-[#eaecf0] bg-[#F8FAFC] p-4 text-[12px] font-mono leading-relaxed text-[#344054] min-h-[460px] whitespace-pre-wrap">
              <div className="text-[11px] font-bold text-[#101828] mb-2 uppercase tracking-wide border-b border-[#D0D5DD] pb-1">
                {activeDoc?.fileType} &bull; {activeDoc?.fileName} ({activeDoc?.fileSize})
              </div>
              {activeDoc?.rawTextPreview || "No optical text representation available for this source document."}
            </div>
          </div>

          {/* Right Column: Editable Case Profile & Care Schedule Requirements */}
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-5 shadow-xs flex flex-col gap-5">
            <div className="border-b border-[#D0D5DD] pb-3">
              <h2 className="text-[16px] font-[500] text-[#101828]">Extracted Case Profile &amp; Care Schedule</h2>
              <p className="text-[12px] text-[#667085]">
                Review extracted parameters. Human confirmation moves the profile to authoritative status v{(caseRecord.validatedProfileVersion || 0) + 1}.
              </p>
            </div>

            {/* Clinical & Patient Demographics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
              <div>
                <label className="block text-[12px] font-medium text-[#344054] mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full rounded border border-[#D0D5DD] p-2 bg-white text-[#101828]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#344054] mb-1">Patient ZIP Territory</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full rounded border border-[#D0D5DD] p-2 bg-white text-[#101828] font-mono"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#344054] mb-1">Discipline Required</label>
                <input
                  type="text"
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full rounded border border-[#D0D5DD] p-2 bg-white text-[#101828]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#344054] mb-1">Authorized Hours / Week</label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full rounded border border-[#D0D5DD] p-2 bg-white text-[#101828]"
                />
              </div>
            </div>

            {/* Structured Care Schedule Requirements Section */}
            <div className="rounded-[6px] border border-[#007AFF]/20 bg-[#007AFF]/5 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#007AFF]/20 pb-2">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#007AFF]">Structured Care Schedule Requirements</h3>
                  <span className="text-[11px] text-[#475467]">
                    Governs caregiver availability checks during deterministic matching.
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#1E7E34] bg-[#34C759]/15 px-2 py-0.5 rounded">
                  Validated Input
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                <div>
                  <label className="block text-[11px] font-medium text-[#344054] mb-1">Required Care Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded border border-[#D0D5DD] bg-white p-2 text-[#101828]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#344054] mb-1">Recurring or Temporary</label>
                  <select
                    value={recurringType}
                    onChange={(e: any) => setRecurringType(e.target.value)}
                    className="w-full rounded border border-[#D0D5DD] bg-white p-2 text-[#101828]"
                  >
                    <option value="Recurring Weekly">Recurring Weekly</option>
                    <option value="One-Time Care">One-Time Care</option>
                    <option value="Temporary / Short-Term">Temporary / Short-Term</option>
                  </select>
                </div>
              </div>

              {/* Day Selection Pills */}
              <div>
                <label className="block text-[11px] font-medium text-[#344054] mb-1.5">
                  Required Days of In-Home Care ({selectedDays.length} selected)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`rounded-[6px] px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          isSelected
                            ? "bg-[#007AFF] text-white shadow-2xs"
                            : "bg-white border border-[#D0D5DD] text-[#344054] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Windows */}
              <div>
                <label className="block text-[11px] font-medium text-[#344054] mb-1.5">
                  Required Time Windows
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {ALL_WINDOWS.map((win) => {
                    const isSelected = selectedWindows.includes(win);
                    return (
                      <button
                        key={win}
                        type="button"
                        onClick={() => toggleWindow(win)}
                        className={`rounded-[6px] p-2 text-[11px] text-left transition-colors border ${
                          isSelected
                            ? "border-[#007AFF] bg-white text-[#007AFF] font-medium shadow-2xs"
                            : "border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        {win}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logistics & Scheduling Constraints */}
              <div>
                <label className="block text-[11px] font-medium text-[#344054] mb-1">
                  Scheduling Constraints &amp; Directives
                </label>
                <textarea
                  rows={2}
                  value={scheduleConstraints}
                  onChange={(e) => setScheduleConstraints(e.target.value)}
                  placeholder="e.g. Patient requires visits before noon due to afternoon dialysis sessions..."
                  className="w-full rounded border border-[#D0D5DD] bg-white p-2 text-[12px] text-[#101828]"
                />
              </div>
            </div>

            {/* Clinical Directives */}
            <div>
              <label className="block text-[12px] font-medium text-[#344054] mb-1">Clinical Directives Summary</label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full rounded border border-[#D0D5DD] bg-white p-2 text-[12px] text-[#101828]"
              />
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}