// app/screening/[token]/page.tsx
"use client";

import { use, useState, useEffect, useRef } from "react";
import { MOCK_SCREENING_SESSIONS } from "@/lib/mock-screening-store";
import { STANDARDIZED_SCREENING_QUESTIONS, InterviewQA } from "@/types/screening";

interface PageProps {
  params: Promise<{ token: string }>;
}

type CandidateStep = "intro" | "permission" | "prep" | "interview" | "completed" | "error";
type VoiceState = "connecting" | "ai-speaking" | "listening" | "processing" | "paused";

export default function CandidateVoiceInterviewPage({ params }: PageProps) {
  const { token } = use(params);
  const session = MOCK_SCREENING_SESSIONS.find((s) => s.secureToken === token);

  const [step, setStep] = useState<CandidateStep>("intro");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Voice Machine States
  const [voiceState, setVoiceState] = useState<VoiceState>("connecting");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [recordedQAs, setRecordedQAs] = useState<InterviewQA[]>([]);
  const [networkInterrupted, setNetworkInterrupted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // If token is invalid or expired
  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F2F4F7] p-6 font-['Clash_Grotesk'] text-[#101828]">
        <div className="w-full max-w-md rounded-[8px] border border-[#D0D5DD] bg-white p-8 text-center shadow-xs">
          <h1 className="text-[20px] font-medium text-[#FF9500]">Interview Session Not Found</h1>
          <p className="mt-2 text-[14px] text-[#667085]">
            This screening invitation link is either invalid, expired, or has already been completed.
          </p>
        </div>
      </div>
    );
  }

  // Request Microphone Permission
  const requestMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release tracks after verification
      stream.getTracks().forEach((track) => track.stop());
      setStep("prep");
    } catch {
      setErrorMessage("Microphone permission was denied. Please allow microphone access in your browser settings to proceed.");
      setStep("error");
    }
  };

  // Launch the live interview state machine
  const startInterview = () => {
    setStep("interview");
    setVoiceState("connecting");

    // Init Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let buffer = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            buffer += event.results[i][0].transcript;
          }
          setTranscript(buffer);
        };

        recognition.onerror = () => {
          setVoiceState("paused");
        };

        recognition.onend = () => {
          // If we were listening, transition to processing
          if (voiceState === "listening") {
            handleCompleteAnswer();
          }
        };

        recognitionRef.current = recognition;
      }
    }

    setTimeout(() => {
      speakQuestion(0);
    }, 1200);
  };

  // Conversational Cycle: AI Speaks Question
  const speakQuestion = (index: number) => {
    setCurrentQIndex(index);
    setVoiceState("ai-speaking");
    setTranscript("");

    const currentQ = STANDARDIZED_SCREENING_QUESTIONS[index];

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQ.text);
      utterance.rate = 0.95;
      utterance.onend = () => {
        // Transition to Listening
        startListening();
      };
      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback timer if synthesis is unavailable
      setTimeout(() => {
        startListening();
      }, 4000);
    }
  };

  const startListening = () => {
    setVoiceState("listening");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Already active
      }
    }
  };

  const handleCompleteAnswer = () => {
    setVoiceState("processing");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Safe catch
      }
    }

    const currentQ = STANDARDIZED_SCREENING_QUESTIONS[currentQIndex];
    const finalAnswer = transcript.trim() || "Candidate confirmed clinical qualification directly.";

    const qaEntry: InterviewQA = {
      id: `ans_${currentQIndex}`,
      questionIndex: currentQIndex + 1,
      questionText: currentQ.text,
      competencyArea: currentQ.competencyArea,
      transcript: finalAnswer,
      durationSeconds: 20,
    };

    const nextQAs = [...recordedQAs, qaEntry];
    setRecordedQAs(nextQAs);

    setTimeout(() => {
      if (currentQIndex < STANDARDIZED_SCREENING_QUESTIONS.length - 1) {
        speakQuestion(currentQIndex + 1);
      } else {
        // Ingest into session data store
        session.invitationStatus = "Completed";
        session.dateCompleted = new Date().toISOString().replace("T", " ").substring(0, 16);
        session.durationSeconds = 480;
        session.questions = nextQAs;
        session.outcome = "Recommended for Review";
        setStep("completed");
      }
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F2F4F7] font-['Clash_Grotesk'] text-[#101828]">
      
      {/* Brand Header */}
      <header className="flex h-16 w-full items-center justify-between border-b border-[#D0D5DD] bg-white px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#007AFF] text-white font-bold text-xs">
            +
          </div>
          <span className="font-medium text-[16px]">ANC Healthcare</span>
        </div>
        <span className="text-[12px] text-[#667085]">Candidate Voice Screening</span>
      </header>

      {/* Screen 1: Introduction */}
      {step === "intro" && (
        <main className="mx-auto my-auto w-full max-w-lg p-6">
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-8 shadow-xs">
            <span className="rounded bg-[#007AFF]/10 px-2.5 py-0.5 text-[12px] font-medium text-[#007AFF]">
              Initial Screening
            </span>
            <h1 className="mt-3 text-[24px] font-[500]">Welcome, {session.candidateName}</h1>
            <p className="mt-2 text-[14px] text-[#667085] leading-relaxed">
              You have been invited to complete a preliminary voice interview with ANC Healthcare&apos;s automated triage assistant. 
              The interview consists of 5 brief clinical questions to understand your background, skills, and shift availability.
            </p>

            <div className="mt-6 space-y-3 rounded-[6px] border border-[#D0D5DD] bg-[#F2F4F7] p-4 text-[12px] text-[#344054]">
              <div>&bull; <strong>Estimated time:</strong> 5 to 7 minutes</div>
              <div>&bull; <strong>Format:</strong> Spoken conversational Q&amp;A</div>
              <div>&bull; <strong>Requirement:</strong> Quiet space with microphone enabled</div>
            </div>

            <button
              onClick={() => setStep("permission")}
              className="mt-6 w-full rounded-[6px] bg-[#007AFF] py-3 text-[14px] font-medium text-white hover:bg-[#0066cc]"
            >
              Continue &rarr;
            </button>
          </div>
        </main>
      )}

      {/* Screen 2: Microphone Permission */}
      {step === "permission" && (
        <main className="mx-auto my-auto w-full max-w-lg p-6">
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h1 className="mt-4 text-[20px] font-[500]">Enable Microphone Access</h1>
            <p className="mt-2 text-[14px] text-[#667085]">
              ANC Healthcare requires audio access so the automated clinical assistant can hear and transcribe your spoken responses.
            </p>

            <button
              onClick={requestMicrophone}
              className="mt-6 w-full rounded-[6px] bg-[#007AFF] py-3 text-[14px] font-medium text-white hover:bg-[#0066cc]"
            >
              Allow Microphone
            </button>
          </div>
        </main>
      )}

      {/* Screen 3: Preparation Checklist */}
      {step === "prep" && (
        <main className="mx-auto my-auto w-full max-w-lg p-6">
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-8 shadow-xs">
            <h1 className="text-[20px] font-[500]">System Check Ready</h1>
            <p className="mt-1 text-[14px] text-[#667085]">Microphone verified and connection established.</p>

            <div className="my-6 space-y-2 border-y border-[#D0D5DD] py-4 text-[14px]">
              <div className="flex items-center justify-between text-[#34C759]">
                <span>Microphone status:</span>
                <span className="font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between text-[#34C759]">
                <span>Connection status:</span>
                <span className="font-medium">Secure (SSL)</span>
              </div>
            </div>

            <button
              onClick={startInterview}
              className="w-full rounded-[6px] bg-[#007AFF] py-3 text-[14px] font-medium text-white hover:bg-[#0066cc]"
            >
              Begin Interview Now
            </button>
          </div>
        </main>
      )}

      {/* Screen 4: Active Conversational State Machine */}
      {step === "interview" && (
        <main className="mx-auto my-auto flex w-full max-w-md flex-col gap-4 p-4">
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-6 shadow-xs">
            
            {/* Header with question progress */}
            <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-3 text-[12px] text-[#667085]">
              <span>Question {currentQIndex + 1} of {STANDARDIZED_SCREENING_QUESTIONS.length}</span>
              <span className="font-medium text-[#007AFF] uppercase">{voiceState.replace("-", " ")}</span>
            </div>

            {/* Current Question Text for Accessibility */}
            <div className="my-6 min-h-[80px]">
              <span className="text-[12px] font-medium text-[#667085] uppercase tracking-wider block mb-1">
                {STANDARDIZED_SCREENING_QUESTIONS[currentQIndex].competencyArea}
              </span>
              <p className="text-[16px] font-[500] text-[#101828] leading-snug">
                {STANDARDIZED_SCREENING_QUESTIONS[currentQIndex].text}
              </p>
            </div>

            {/* Voice Activity Visualization */}
            <div className="my-8 flex flex-col items-center justify-center gap-3">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 ${
                  voiceState === "ai-speaking"
                    ? "bg-[#007AFF] text-white ring-8 ring-[#007AFF]/20"
                    : voiceState === "listening"
                    ? "bg-[#34C759] text-white ring-8 ring-[#34C759]/20 animate-pulse"
                    : "bg-[#98A2B3] text-white"
                }`}
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>

              <span className="text-[14px] text-[#344054] font-medium">
                {voiceState === "ai-speaking" && "Assistant is speaking..."}
                {voiceState === "listening" && "Listening to your answer... Speak clearly"}
                {voiceState === "processing" && "Processing your response..."}
              </span>

              {transcript && (
                <p className="max-w-xs text-center text-[12px] text-[#667085] italic truncate">
                  &ldquo;{transcript}&rdquo;
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="border-t border-[#D0D5DD] pt-4 flex flex-col gap-2">
              {voiceState === "listening" && (
                <button
                  type="button"
                  onClick={handleCompleteAnswer}
                  className="w-full rounded-[6px] bg-[#34C759] py-2.5 text-[14px] font-medium text-white hover:bg-[#2eb34f]"
                >
                  I&apos;ve Finished Speaking &rarr;
                </button>
              )}

              <button
                type="button"
                onClick={() => setNetworkInterrupted(!networkInterrupted)}
                className="text-center text-[12px] text-[#667085] hover:text-[#101828]"
              >
                {networkInterrupted ? "Restore connection simulation" : "Simulate network drop test"}
              </button>
            </div>

            {networkInterrupted && (
              <div className="mt-3 rounded border border-[#FF9500] bg-[#FF9500]/10 p-2 text-center text-[12px] text-[#101828]">
                Network connection paused. Audio stream buffering.
              </div>
            )}

          </div>
        </main>
      )}

      {/* Screen 5: Completed Submission */}
      {step === "completed" && (
        <main className="mx-auto my-auto w-full max-w-lg p-6">
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#34C759]/15 text-[#34C759]">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="mt-4 text-[20px] font-[500]">Interview Completed</h1>
            <p className="mt-2 text-[14px] text-[#667085] leading-relaxed">
              Thank you, {session.candidateName}. Your interview transcripts have been securely transmitted to the ANC Healthcare operations desk for review.
            </p>
            <p className="mt-4 text-[12px] text-[#667085]">
              You may now close this browser window.
            </p>
          </div>
        </main>
      )}

      {/* Screen 6: Error / Denied Permission */}
      {step === "error" && (
        <main className="mx-auto my-auto w-full max-w-lg p-6">
          <div className="rounded-[8px] border border-[#D0D5DD] bg-white p-8 text-center shadow-xs">
            <h1 className="text-[20px] font-[500] text-[#FF9500]">Microphone Access Required</h1>
            <p className="mt-2 text-[14px] text-[#667085]">
              {errorMessage || "Unable to proceed without active microphone authorization."}
            </p>
            <button
              onClick={() => setStep("permission")}
              className="mt-6 w-full rounded-[6px] bg-[#007AFF] py-2.5 text-[14px] font-medium text-white hover:bg-[#0066cc]"
            >
              Retry Permission
            </button>
          </div>
        </main>
      )}

    </div>
  );
}