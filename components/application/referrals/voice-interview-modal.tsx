// components/application/referrals/voice-interview-modal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Referral } from "@/types/referral";
import { MOCK_CLINICIANS, Clinician } from "@/types/clinician";

interface VoiceInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated: (newCase: Referral) => void;
}

interface InterviewMessage {
  speaker: "ai" | "user";
  text: string;
  timestamp: string;
}

export function VoiceInterviewModal({
  isOpen,
  onClose,
  onCaseCreated,
}: VoiceInterviewModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [messages, setMessages] = useState<InterviewMessage[]>([
    {
      speaker: "ai",
      text: "Hello, this is the ANC Automated Triage Assistant. Please state the patient's full name, date of birth, and primary symptoms or injury.",
      timestamp: "Just now",
    },
  ]);
  const [transcript, setTranscript] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Extracted entities preview
  const [extractedName, setExtractedName] = useState("");
  const [extractedCondition, setExtractedCondition] = useState("");
  const [extractedPriority, setExtractedPriority] = useState<Referral["priority"]>("Standard");

  const recognitionRef = useRef<any>(null);

  // Clinical prompt guide
  const interviewPrompts = [
    "What is the patient's full name and date of birth?",
    "Describe the wound or primary clinical complaint. Is there any active drainage, necrotic tissue, or infection?",
    "What is the current pain level (1-10) and mobility status of the patient?",
    "Does the patient require emergency transfer, urgent visit within 24 hours, or standard intake?",
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentSessionText = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentSessionText += event.results[i][0].transcript;
          }
          setTranscript(currentSessionText);
          parseClinicalEntities(currentSessionText);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Simple heuristic entity extractor from transcript
  const parseClinicalEntities = (text: string) => {
    const lower = text.toLowerCase();

    // Priority heuristic
    if (lower.includes("urgent") || lower.includes("severe") || lower.includes("grade 3") || lower.includes("grade 4") || lower.includes("emergency")) {
      setExtractedPriority("Urgent");
    } else if (lower.includes("moderate") || lower.includes("high") || lower.includes("post-op")) {
      setExtractedPriority("High");
    }

    // Condition heuristic
    if (lower.includes("ulcer") || lower.includes("wound") || lower.includes("burn") || lower.includes("dressing")) {
      setExtractedCondition("Diabetic Wound / Neuropathic Ulceration");
    } else if (lower.includes("stroke") || lower.includes("mobility") || lower.includes("therapy") || lower.includes("fall")) {
      setExtractedCondition("Post-Acute Mobility & Physical Therapy");
    } else if (text.trim().length > 10 && !extractedCondition) {
      setExtractedCondition(text.slice(0, 45) + "...");
    }

    // Name heuristic (look for words after 'patient' or 'name is')
    const nameMatch = text.match(/(?:patient|name is|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (nameMatch && nameMatch[1]) {
      setExtractedName(nameMatch[1]);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      // Fallback if browser doesn't support Web Speech API
      simulateVoiceInput();
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (transcript.trim()) {
        commitUserResponse(transcript);
      }
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const simulateVoiceInput = () => {
    setIsRecording(true);
    setTimeout(() => {
      const mockText = "Patient is Beatrice Lawson, born 1954-08-12. Severe venous stasis ulcer with purulent exudate requiring urgent debridement.";
      setTranscript(mockText);
      parseClinicalEntities(mockText);
      setIsRecording(false);
      commitUserResponse(mockText);
    }, 2000);
  };

  const commitUserResponse = (text: string) => {
    const updatedMessages: InterviewMessage[] = [
      ...messages,
      { speaker: "user", text, timestamp: "Just now" },
    ];
    setMessages(updatedMessages);
    setTranscript("");

    // Advance AI clinical question
    if (currentPromptIndex < interviewPrompts.length - 1) {
      setIsSynthesizing(true);
      setTimeout(() => {
        const nextIdx = currentPromptIndex + 1;
        setCurrentPromptIndex(nextIdx);
        setMessages((prev) => [
          ...prev,
          {
            speaker: "ai",
            text: interviewPrompts[nextIdx],
            timestamp: "Just now",
          },
        ]);
        setIsSynthesizing(false);
      }, 900);
    }
  };

  // Find optimal nurse allocation
  const allocateClinician = (condition: string): Clinician | null => {
    const condLower = condition.toLowerCase();
    let targetDiscipline = "Registered Nurse (RN)";
    if (condLower.includes("ulcer") || condLower.includes("wound")) {
      targetDiscipline = "Wound Care";
    } else if (condLower.includes("therapy") || condLower.includes("mobility")) {
      targetDiscipline = "Physical Therapist";
    }

    const match = MOCK_CLINICIANS.find(
      (c) =>
        c.discipline.toLowerCase().includes(targetDiscipline.toLowerCase()) &&
        c.activeCaseload < c.maxCaseload
    );
    return match || MOCK_CLINICIANS[0];
  };

  const handleFinalizeCase = () => {
    const finalName = extractedName.trim() || "Voice Intake Patient";
    const finalCondition = extractedCondition.trim() || "Wound Care Evaluation Required";
    const assigned = allocateClinician(finalCondition);
    const caseId = `REF-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCase: Referral = {
      id: caseId,
      patientName: finalName,
      dob: "1962-09-15",
      primaryCondition: finalCondition,
      priority: extractedPriority,
      triageStage: assigned ? "Matched" : "Ready for Matching",
      extractionStatus: "Extracted",
      referringProvider: assigned
        ? `Voice Triage (Assigned: ${assigned.name})`
        : "ANC Voice Intake Assistant",
      receivedDate: new Date().toISOString().split("T")[0],
    };

    onCaseCreated(newCase);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="flex w-full max-w-2xl flex-col gap-5 rounded-[14px] border border-[#eaecf0] bg-white p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eaecf0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-body-medium font-semibold text-text-primary">
                AI Voice Clinical Triage Interview
              </h3>
              <p className="text-caption-2-regular text-text-secondary">
                Hands-free conversational intake, real-time entity recognition, and nurse routing.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary text-base"
          >
            &#x2715;
          </button>
        </div>

        {/* Live Audio Conversation Feed */}
        <div className="flex flex-col gap-3 rounded-[10px] border border-[#eaecf0] bg-slate-50/70 p-4 max-h-[260px] overflow-y-auto">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.speaker === "ai" ? "items-start" : "items-end"
              }`}
            >
              <span className="text-[10px] font-semibold text-text-tertiary uppercase mb-0.5">
                {m.speaker === "ai" ? "Clinical Assistant" : "Clinician / Caller"}
              </span>
              <div
                className={`rounded-[10px] px-3.5 py-2 text-body-2-regular max-w-[85%] ${
                  m.speaker === "ai"
                    ? "bg-white border border-[#eaecf0] text-text-primary shadow-2xs"
                    : "bg-[#007aff] text-white"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isSynthesizing && (
            <div className="flex items-center gap-1.5 text-caption-2-medium text-[#007aff] italic">
              <span className="h-1.5 w-1.5 rounded-full bg-[#007aff] animate-ping" />
              Assistant is analyzing and preparing next question...
            </div>
          )}
        </div>

        {/* Real-Time Extraction Preview Bar */}
        <div className="rounded-[10px] border border-[#eaecf0] bg-white p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption-2-bold font-bold uppercase tracking-wider text-text-tertiary">
              Entities Extracted from Voice Audio
            </span>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
              Live NLP Pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-caption-1-regular">
            <div className="flex flex-col rounded-md bg-slate-50 p-2 border border-[#eaecf0]">
              <span className="text-text-tertiary text-[10px]">Patient Name</span>
              <span className="font-medium text-text-primary truncate">
                {extractedName || "Listening..."}
              </span>
            </div>
            <div className="flex flex-col rounded-md bg-slate-50 p-2 border border-[#eaecf0]">
              <span className="text-text-tertiary text-[10px]">Identified Condition</span>
              <span className="font-medium text-text-primary truncate">
                {extractedCondition || "Listening..."}
              </span>
            </div>
            <div className="flex flex-col rounded-md bg-slate-50 p-2 border border-[#eaecf0]">
              <span className="text-text-tertiary text-[10px]">Assessed Acuity</span>
              <span className="font-medium text-text-primary">
                {extractedPriority}
              </span>
            </div>
          </div>
        </div>

        {/* Mic Controls & Visualizer */}
        <div className="flex flex-col items-center justify-center gap-2 py-1">
          <button
            type="button"
            onClick={toggleRecording}
            className={`flex h-16 w-16 items-center justify-center rounded-full transition shadow-md ${
              isRecording
                ? "bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse"
                : "bg-[#007aff] text-white hover:bg-[#0062cc]"
            }`}
          >
            {isRecording ? (
              <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 20 20">
                <rect x="6" y="6" width="8" height="8" rx="1" />
              </svg>
            ) : (
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
          <span className="text-caption-1-medium text-text-secondary">
            {isRecording ? "Recording live intake... tap to pause" : "Tap microphone to speak"}
          </span>
          {transcript && (
            <p className="text-caption-2-regular text-slate-500 italic max-w-md text-center truncate">
              &quot;{transcript}&quot;
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between border-t border-[#eaecf0] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[8px] border border-[#d0d5dd] bg-white px-3.5 py-1.5 text-caption-1-medium text-text-secondary hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleFinalizeCase}
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#007aff] px-4 py-2 text-body-2-medium font-medium text-white shadow-xs transition hover:bg-[#0062cc]"
          >
            Create Case &amp; Auto-Allocate Nurse &rarr;
          </button>
        </div>

      </div>
    </div>
  );
}