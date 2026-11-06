// lib/interview-service.ts
import { InterviewSessionRecord } from "@/types/interview-session";

export const MOCK_INTERVIEW_SESSIONS: InterviewSessionRecord[] = [
  {
    sessionId: "IV-9012",
    caregiverId: "CG-8012",
    caregiverName: "Elena V. Rostova",
    interviewType: "Initial Screening",
    questionSetVersion: "ANC-CLINICAL-V3",
    sessionStatus: "Completed",
    processingStatus: "Completed",
    reviewStatus: "Reviewed",
    date: "2026-11-04",
    startedAt: "2026-11-04 09:12",
    completedAt: "2026-11-04 09:27",
    durationSeconds: 900,
    hasAudioRecording: true,
    audioRecordingUrl: "/mock-audio/elena-interview.mp3",
    transcript: [
      {
        id: "t-1",
        speaker: "ai-assistant",
        timestamp: "09:12",
        messageText: "Hello Elena. Welcome to the ANC Healthcare clinical intake. Could you summarize your clinical background and primary certifications?",
      },
      {
        id: "t-2",
        speaker: "caregiver",
        timestamp: "09:13",
        messageText: "Hi. I'm a Registered Nurse with 14 years in direct patient care. I've specialized in Wound Care (RN-WCC) for the last 6 years, primarily managing post-surgical wound VAC systems and stasis ulcers.",
      },
      {
        id: "t-3",
        speaker: "ai-assistant",
        timestamp: "09:14",
        messageText: "Thank you Elena. What are your travel preferences and scheduling capacity per week?",
      },
      {
        id: "t-4",
        speaker: "caregiver",
        timestamp: "09:15",
        messageText: "I can work up to 32 hours weekly, mainly weekday mornings and early afternoons. I travel up to 15 miles around Pittsburgh East, including ZIP codes 15213, 15206, and 15228.",
      },
    ],
    structuredData: {
      professionalBackground: {
        experienceSummary: {
          value: "14 years in direct bedside nursing, specializing in post-op complex wound renewal and vacuum therapy.",
          reviewState: "Human Confirmed",
          source: "ai-extracted",
        },
        yearsExperience: {
          value: 14,
          reviewState: "Human Confirmed",
          source: "ai-extracted",
        },
        priorSettings: {
          value: ["Home Health", "Surgical Step-Down", "Outpatient Clinic"],
          reviewState: "Human Confirmed",
          source: "ai-extracted",
        },
      },
      clinicalBackground: {
        primaryDiscipline: {
          value: "Wound Care Certified Nurse (RN-WCC)",
          reviewState: "Human Confirmed",
          source: "ai-extracted",
        },
        familiarConditions: {
          value: ["Venous Stasis Ulcers", "Post-Debridement VAC", "Compression Dressing"],
          reviewState: "Human Confirmed",
          source: "ai-extracted",
        },
        specializedProcedures: {
          value: ["Negative Pressure Wound Therapy (NPWT)", "Drain Sanitization"],
          reviewState: "Human Confirmed",
          source: "ai-extracted",
        },
      },
      preferences: {
        workArrangement: {
          value: "Part-Time Dedicated Visits",
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
        shiftPreferences: {
          value: "Weekday Mornings",
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
      },
      logistics: {
        travelRadiusMiles: {
          value: 15,
          reviewState: "Human Confirmed",
          source: "ai-extracted",
        },
        territoryZipCodes: {
          value: ["15213", "15206", "15228"],
          reviewState: "Human Confirmed",
          source: "ai-extracted",
        },
        transportationReliability: {
          value: "Personal vehicle with valid inspection",
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
      },
      availability: {
        weeklyHoursCapacity: {
          value: 32,
          reviewState: "Human Confirmed",
          source: "ai-extracted",
        },
        daysAvailableSummary: {
          value: "Mon, Tue, Wed, Fri Mornings",
          reviewState: "Human Confirmed",
          source: "ai-extracted",
        },
      },
      insights: {
        unclearItems: [],
        missingItems: [],
        inconsistenciesWithProfile: [],
        notesForReviewer: "Candidate spoke clearly; licenses match PA State Board lookup.",
      },
    },
    reviewedBy: "Dr. R. Sterling (Lead Clinical Dispatcher)",
    reviewedAt: "2026-11-04 10:15",
    internalReviewNotes: "Interview confirmed. Candidate demonstrated clear clinical competence in NPWT protocols.",
    history: [
      {
        timestamp: "2026-11-04 09:12",
        actor: "Caregiver & AI Voice Agent",
        action: "Session Initiated & Completed",
        notes: "15 min call completed with full audio fidelity.",
      },
      {
        timestamp: "2026-11-04 09:28",
        actor: "System AI Engine",
        action: "NLP Processing Completed",
        notes: "Structured entities populated into draft session record.",
      },
      {
        timestamp: "2026-11-04 10:15",
        actor: "Dr. R. Sterling",
        action: "Human Review Completed",
        notes: "Approved session entities and synced verified attributes to Caregiver profile.",
      },
    ],
  },
  {
    sessionId: "IV-9014",
    caregiverId: "CG-8013",
    caregiverName: "Marcus Brody",
    interviewType: "Initial Screening",
    questionSetVersion: "ANC-CLINICAL-V3",
    sessionStatus: "Completed",
    processingStatus: "Completed",
    reviewStatus: "Awaiting Human Review",
    date: "2026-11-05",
    startedAt: "2026-11-05 11:20",
    completedAt: "2026-11-05 11:36",
    durationSeconds: 960,
    hasAudioRecording: true,
    transcript: [
      {
        id: "t-10",
        speaker: "ai-assistant",
        timestamp: "11:20",
        messageText: "Hello Marcus. Welcome to ANC. Could you share your primary physical therapy specializations?",
      },
      {
        id: "t-11",
        speaker: "caregiver",
        timestamp: "11:21",
        messageText: "Hello. I'm a Licensed Physical Therapist with 8 years experience. I focus primarily on neuro-rehabilitation, gait retraining, and fall prevention for post-stroke patients.",
      },
      {
        id: "t-12",
        speaker: "ai-assistant",
        timestamp: "11:23",
        messageText: "What are your desired hours, and what is your travel territory?",
      },
      {
        id: "t-13",
        speaker: "caregiver",
        timestamp: "11:24",
        messageText: "I'm looking for 20 to 25 hours weekly in the South Hills area, around Mount Lebanon (15228). I prefer daytime slots.",
      },
    ],
    structuredData: {
      professionalBackground: {
        experienceSummary: {
          value: "8 years in neuro-rehabilitation and post-stroke gait therapy.",
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
        yearsExperience: {
          value: 8,
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
        priorSettings: {
          value: ["Inpatient Rehabilitation", "Home Health"],
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
      },
      clinicalBackground: {
        primaryDiscipline: {
          value: "Physical Therapist (PT)",
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
        familiarConditions: {
          value: ["CVA / Stroke", "Gait Instability", "Parkinsonian Movement"],
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
        specializedProcedures: {
          value: ["Transfer Training", "Gait Assessment", "Assistive Device Sizing"],
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
      },
      preferences: {
        workArrangement: {
          value: "Flexible Part-Time",
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
        shiftPreferences: {
          value: "Daytime (09:00 - 15:00)",
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
      },
      logistics: {
        travelRadiusMiles: {
          value: 12,
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
        territoryZipCodes: {
          value: ["15228", "15216"],
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
        transportationReliability: {
          value: "Personal vehicle with insured coverage",
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
      },
      availability: {
        weeklyHoursCapacity: {
          value: 25,
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
        daysAvailableSummary: {
          value: "Mon through Thu Daytimes",
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
      },
      insights: {
        unclearItems: ["Verify CPR credential card expiration (not specified verbally)"],
        missingItems: [],
        inconsistenciesWithProfile: [],
        notesForReviewer: "Requires operator sign-off before talent pool matching.",
      },
    },
    history: [
      {
        timestamp: "2026-11-05 11:20",
        actor: "Caregiver & AI Voice Agent",
        action: "Session Completed",
        notes: "16 min interview parsed successfully.",
      },
    ],
  },
  {
    sessionId: "IV-9015",
    caregiverId: "CG-8014",
    caregiverName: "Amina Al-Mansoor",
    interviewType: "Initial Screening",
    questionSetVersion: "ANC-CLINICAL-V3",
    sessionStatus: "Interrupted",
    processingStatus: "Processing",
    reviewStatus: "Requires Follow-up",
    date: "2026-11-06",
    startedAt: "2026-11-06 08:10",
    hasAudioRecording: false,
    transcript: [
      {
        id: "t-20",
        speaker: "ai-assistant",
        timestamp: "08:10",
        messageText: "Hello Amina. Welcome to ANC Healthcare. Could you state your discipline and previous home care background?",
      },
      {
        id: "t-21",
        speaker: "caregiver",
        timestamp: "08:11",
        messageText: "Hello. I've worked as a Home Health Aide (HHA) for over 5 years. I specialize in dementia care and activities of daily living...",
      },
    ],
    structuredData: {
      professionalBackground: {
        experienceSummary: {
          value: "5+ years as Home Health Aide.",
          reviewState: "Uncertain",
          source: "ai-extracted",
        },
        yearsExperience: {
          value: 5,
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
        priorSettings: {
          value: ["Private In-Home"],
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
      },
      clinicalBackground: {
        primaryDiscipline: {
          value: "Home Health Aide (HHA)",
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
        familiarConditions: {
          value: ["Dementia / Alzheimer's"],
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
        specializedProcedures: {
          value: ["ADL Assistance", "Transfer Support"],
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
      },
      preferences: {
        workArrangement: {
          value: "Pending",
          reviewState: "Missing",
          source: "ai-extracted",
        },
        shiftPreferences: {
          value: "Pending",
          reviewState: "Missing",
          source: "ai-extracted",
        },
      },
      logistics: {
        travelRadiusMiles: {
          value: 10,
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
        territoryZipCodes: {
          value: ["15232"],
          reviewState: "AI Extracted",
          source: "ai-extracted",
        },
        transportationReliability: {
          value: "Pending",
          reviewState: "Missing",
          source: "ai-extracted",
        },
      },
      availability: {
        weeklyHoursCapacity: {
          value: 0,
          reviewState: "Missing",
          source: "ai-extracted",
        },
        daysAvailableSummary: {
          value: "Pending Call Resumption",
          reviewState: "Missing",
          source: "ai-extracted",
        },
      },
      insights: {
        unclearItems: ["Session disconnected during schedule availability section"],
        missingItems: ["Weekly hours capacity", "Shift preferences"],
        inconsistenciesWithProfile: [],
        notesForReviewer: "Call interrupted. Operator can trigger follow-up interview or resumption.",
      },
    },
    followUpReason: "Connection dropped at minute 4. Missing availability & logistics answers.",
    history: [
      {
        timestamp: "2026-11-06 08:14",
        actor: "System Voice Telephony",
        action: "Connection Interrupted",
        notes: "Carrier disconnect detected. Session marked as Interrupted with partial answers preserved.",
      },
    ],
  },
];