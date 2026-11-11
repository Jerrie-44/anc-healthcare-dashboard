// lib/caregiver-directory-service.ts
import { 
    CaregiverDirectoryRecord, 
    CaregiverDirectoryMetrics,
    CaregiverCertificationRecord,
    CaregiverDocument
  } from "@/types/caregiver";
  import { getStoredCases } from "@/lib/cases-store";
  
  const BASE_CAREGIVER_RECORDS: CaregiverDirectoryRecord[] = [
    {
      id: "CG-2026-101",
      name: "Eleanor Vance, RN",
      qualification: "Registered Nurse (RN)",
      zipCode: "15213",
      serviceArea: "Pittsburgh East End (Oakland / Shadyside)",
      availability: "Available",
      screening: "Completed",
      status: "Active",
      matchingEligibility: "Eligible",
      voiceScreeningScore: 4.8,
      activeCertifications: ["Wound Care Certified (WCC)", "BLS", "ACLS"],
      yearsExperience: 8,
      isSmoker: false,
      phone: "(412) 555-0192",
      email: "e.vance@anc-care.org",
      residentialAddress: "4820 Centre Ave, Apt 4B",
      city: "Pittsburgh",
      state: "PA",
      emergencyContact: {
        name: "Marcus Vance",
        relationship: "Spouse",
        phone: "(412) 555-0199",
      },
      clinicalSkills: [
        "Negative Pressure Wound VAC Therapy",
        "Central Line Dressing Protocols",
        "Peripheral IV Insertion",
        "Post-Surgical Triage",
        "Medication Reconciliation"
      ],
      languages: ["English (Native)", "Spanish (Conversational)"],
      weeklyCapacityHours: 36,
      preferredDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      schedulingRestrictions: "Unavailable alternate Friday evenings due to clinical symposium.",
      joinedDate: "2023-04-12",
      detailedCertifications: [
        {
          id: "CERT-001",
          name: "PA State Registered Nurse License",
          issuingOrg: "Pennsylvania State Board of Nursing",
          issueDate: "2016-06-15",
          expiryDate: "2027-10-31",
          status: "Valid",
          verificationSource: "PA Department of State Primary Source PALS"
        },
        {
          id: "CERT-002",
          name: "Wound Care Certified (WCC)",
          issuingOrg: "National Alliance of Wound Care and Ostomy (NAWCO)",
          issueDate: "2019-03-10",
          expiryDate: "2027-03-10",
          status: "Valid",
          verificationSource: "NAWCO National Registry"
        },
        {
          id: "CERT-003",
          name: "Basic Life Support (BLS for Healthcare Providers)",
          issuingOrg: "American Heart Association",
          issueDate: "2025-01-20",
          expiryDate: "2027-01-20",
          status: "Valid",
          verificationSource: "AHA eCard Verification"
        }
      ],
      documents: [
        {
          id: "DOC-RN-01",
          category: "State Board License",
          documentName: "RN_License_Eleanor_Vance_2026.pdf",
          submissionDate: "2026-01-10",
          reviewStatus: "Verified",
          expiryDate: "2027-10-31",
          reviewedBy: "Chief Clinical Officer",
          reviewedAt: "2026-01-12 11:30",
          version: 1,
        },
        {
          id: "DOC-RN-02",
          category: "BLS / CPR Certification",
          documentName: "AHA_BLS_Card_Vance.pdf",
          submissionDate: "2026-01-21",
          reviewStatus: "Verified",
          expiryDate: "2027-01-20",
          reviewedBy: "Credentialing Coordinator",
          reviewedAt: "2026-01-22 09:15",
          version: 1,
        }
      ],
      screeningDetails: {
        sessionId: "AI-VOICE-SES-88219",
        completedAt: "2026-02-04 14:22",
        lastUpdatedDate: "2026-02-05 09:10",
        operatorReviewStatus: "Reviewed & Approved",
        operatorReviewerName: "Clinical Operations Intake Lead",
        operatorReviewedAt: "2026-02-05 10:15",
        operatorReviewNotes: "Nurse demonstrated superior bedside communication and protocols on surgical wound care and aseptic technique.",
        overallScore: 4.8,
        strengths: [
          "8 years acute hospital & home health nursing with specialized Wound VAC handling",
          "Clear, structured clinical communication adhering to SBAR standards",
          "Active PA license with zero disciplinary disclosures"
        ],
        potentialConcerns: [
          "Prefers not to accept cases requiring long unpaved rural travel beyond Allegheny County perimeter"
        ],
        reviewItems: [
          "Confirmed non-smoker status and comfortable with domestic pets"
        ],
        transcriptExcerpt: "Operator AI: 'Can you describe your experience managing surgical wound irrigations in home care?' Eleanor: 'I have managed complex abdominal and orthopedic post-op wounds for over 5 years, routinely calibrating KCI wound VAC systems and coordinating weekly wound size charts with attending surgeons.'",
        caregiverPreferences: {
          preferredHours: "Morning (08:00 - 13:00) & Afternoon (13:00 - 17:00)",
          preferredShifts: ["Day Shift", "Early Morning"],
          maxCommuteMiles: 15,
          preferredLocations: ["Oakland", "Shadyside", "Squirrel Hill", "Bloomfield"],
          householdAllergiesNotice: "No environmental pet allergies declared."
        }
      },
      assignments: [
        {
          caseId: "CASE-2026-901",
          patientName: "Harold Jenkins",
          careRequirement: "Registered Nurse (RN) • 16 hrs/wk",
          assignmentDate: "2026-03-01",
          status: "Active",
          validationType: "Human Validated",
          matchScore: 96,
          outcomeNotes: "Active post-op wound VAC irrigation and weekly dressing change protocol."
        }
      ]
    },
    {
      id: "CG-2026-102",
      name: "Jerome Bell, PT",
      qualification: "Physical Therapist (PT)",
      zipCode: "15206",
      serviceArea: "Pittsburgh East End (East Liberty)",
      availability: "Available",
      screening: "Completed",
      status: "Active",
      matchingEligibility: "Eligible",
      voiceScreeningScore: 4.9,
      activeCertifications: ["Neurological Rehab Specialist", "CPR/AED", "Geriatric Balance"],
      yearsExperience: 11,
      isSmoker: false,
      phone: "(412) 555-0143",
      email: "j.bell@anc-care.org",
      residentialAddress: "5910 Penn Ave",
      city: "Pittsburgh",
      state: "PA",
      clinicalSkills: [
        "Stroke Gait Re-education",
        "Bilateral Cane Transition",
        "Vestibular Therapy",
        "Fall Prevention Safety Audits"
      ],
      languages: ["English (Native)"],
      weeklyCapacityHours: 32,
      preferredDays: ["Monday", "Wednesday", "Friday"],
      joinedDate: "2022-09-18",
      detailedCertifications: [
        {
          id: "CERT-004",
          name: "PA Physical Therapist License",
          issuingOrg: "State Board of Physical Therapy",
          issueDate: "2013-05-12",
          expiryDate: "2026-12-31",
          status: "Valid",
          verificationSource: "PA PALS Registry"
        }
      ],
      documents: [
        {
          id: "DOC-PT-01",
          category: "State Board License",
          documentName: "PT_License_Jerome_Bell.pdf",
          submissionDate: "2025-12-01",
          reviewStatus: "Verified",
          expiryDate: "2026-12-31",
          reviewedBy: "Clinical Operations Lead",
          reviewedAt: "2025-12-03 14:00",
          version: 1,
        }
      ],
      screeningDetails: {
        sessionId: "AI-VOICE-SES-88102",
        completedAt: "2026-01-18 10:15",
        operatorReviewStatus: "Reviewed & Approved",
        overallScore: 4.9,
        strengths: ["11 years experience in neuro-rehab and geriatric mobility reconditioning"],
        potentialConcerns: [],
        reviewItems: ["Requires advance notice for Saturday home assessment requests"],
        caregiverPreferences: {
          preferredHours: "Daytime (09:00 - 16:00)",
          preferredShifts: ["Weekday Mornings"],
          maxCommuteMiles: 18,
          preferredLocations: ["East Liberty", "Highland Park", "Point Breeze"]
        }
      },
      assignments: [
        {
          caseId: "CASE-2026-903",
          patientName: "Walter G. Henderson",
          careRequirement: "Physical Therapist (PT) • 6 hrs/wk",
          assignmentDate: "2026-03-01",
          status: "Active",
          validationType: "Human Validated",
          matchScore: 92,
          outcomeNotes: "Post-stroke mobility reconditioning and bilateral cane gait transition."
        }
      ]
    },
    {
      id: "CG-2026-103",
      name: "Maria Santos, HHA",
      qualification: "Home Health Aide (HHA)",
      zipCode: "15217",
      serviceArea: "Pittsburgh South / Squirrel Hill",
      availability: "Available",
      screening: "Completed",
      status: "Active",
      matchingEligibility: "Eligible",
      voiceScreeningScore: 4.9,
      activeCertifications: ["State Certified HHA", "CPR/First Aid", "Hoyer Lift Certified"],
      yearsExperience: 6,
      isSmoker: false,
      phone: "(412) 555-0188",
      email: "m.santos@anc-care.org",
      city: "Pittsburgh",
      state: "PA",
      clinicalSkills: [
        "Assisted Daily Living (ADL)",
        "Bathing & Hygiene Protocol",
        "Meal Prep & Dietary Adherence",
        "Transfer Oversight"
      ],
      languages: ["English", "Spanish"],
      weeklyCapacityHours: 40,
      preferredDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      joinedDate: "2024-01-15",
      detailedCertifications: [
        {
          id: "CERT-005",
          name: "Pennsylvania HHA Certification",
          issuingOrg: "PA Department of Health",
          issueDate: "2020-04-10",
          expiryDate: "2027-04-10",
          status: "Valid",
          verificationSource: "PA Health Registry"
        }
      ],
      documents: [],
      screeningDetails: {
        sessionId: "AI-VOICE-SES-87991",
        completedAt: "2026-01-12 11:00",
        operatorReviewStatus: "Reviewed & Approved",
        overallScore: 4.9,
        strengths: ["Bilingual, extensive Alzheimer's transfer oversight experience"],
        potentialConcerns: [],
        reviewItems: [],
        caregiverPreferences: {
          preferredHours: "Full-Time Days (08:00 - 16:30)",
          preferredShifts: ["Morning", "Afternoon"],
          maxCommuteMiles: 12,
          preferredLocations: ["Squirrel Hill", "Greenfield", "Oakland"]
        }
      },
      assignments: [
        {
          caseId: "CASE-2026-902",
          patientName: "Beatrice Morales",
          careRequirement: "Home Health Aide (HHA) • 20 hrs/wk",
          assignmentDate: "2026-03-02",
          status: "Active",
          validationType: "Human Validated",
          matchScore: 94,
          outcomeNotes: "Bathing assistance, meal prep, and transfer oversight."
        }
      ]
    },
    {
      id: "CG-2026-104",
      name: "Marcus Washington, RN",
      qualification: "Registered Nurse (RN)",
      zipCode: "15222",
      serviceArea: "Downtown / Strip District",
      availability: "Unavailable",
      screening: "Completed",
      status: "On Assignment",
      matchingEligibility: "Requires Review",
      voiceScreeningScore: 4.6,
      activeCertifications: ["IV Infusion Certified", "BLS", "Telemetry"],
      yearsExperience: 5,
      isSmoker: false,
      phone: "(412) 555-0112",
      email: "m.washington@anc-care.org",
      city: "Pittsburgh",
      state: "PA",
      clinicalSkills: ["Central Line Infusion", "Chemo Support", "Palliative Triage"],
      languages: ["English"],
      weeklyCapacityHours: 40,
      preferredDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      joinedDate: "2023-11-04",
      assignments: [
        {
          caseId: "CASE-2025-110",
          patientName: "Eleanor Rigby",
          careRequirement: "Registered Nurse (RN) • 24 hrs/wk",
          assignmentDate: "2025-12-10",
          period: "Dec 2025 - Present",
          status: "Active",
          validationType: "Human Validated",
          matchScore: 91,
          outcomeNotes: "Daily IV infusion and central port flush."
        }
      ]
    },
    {
      id: "CG-2026-105",
      name: "Sophia Zhang, HHA",
      qualification: "Home Health Aide (HHA)",
      zipCode: "15213",
      serviceArea: "Pittsburgh East End",
      availability: "Limited Availability",
      screening: "Completed",
      status: "Active",
      matchingEligibility: "Eligible",
      voiceScreeningScore: 4.7,
      activeCertifications: ["Dementia Care Specialist", "First Aid"],
      yearsExperience: 4,
      isSmoker: false,
      phone: "(412) 555-0164",
      email: "s.zhang@anc-care.org",
      city: "Pittsburgh",
      state: "PA",
      clinicalSkills: ["Dementia Redirection", "Vital Signs Logging", "Meal Prep"],
      languages: ["English", "Mandarin"],
      weeklyCapacityHours: 20,
      preferredDays: ["Saturday", "Sunday"],
      joinedDate: "2024-05-20"
    },
    {
      id: "CG-2026-106",
      name: "David Kowalski, PT",
      qualification: "Physical Therapist (PT)",
      zipCode: "15237",
      serviceArea: "North Hills (Ross Township)",
      availability: "Unavailable",
      screening: "Completed",
      status: "On Assignment",
      matchingEligibility: "Requires Review",
      voiceScreeningScore: 4.5,
      activeCertifications: ["Orthopedic Clinical Specialist", "BLS"],
      yearsExperience: 9,
      isSmoker: false,
      phone: "(412) 555-0177",
      email: "d.kowalski@anc-care.org",
      city: "Pittsburgh",
      state: "PA",
      weeklyCapacityHours: 35,
      joinedDate: "2021-08-30"
    },
    {
      id: "CG-2026-107",
      name: "Aaliyah Robinson, HHA",
      qualification: "Home Health Aide (HHA)",
      zipCode: "15219",
      serviceArea: "Hill District / Uptown",
      availability: "Available",
      screening: "Needs Review",
      status: "Under Review",
      matchingEligibility: "Requires Review",
      voiceScreeningScore: 3.8,
      activeCertifications: ["State Certified HHA"],
      yearsExperience: 2,
      isSmoker: false,
      phone: "(412) 555-0199",
      email: "a.robinson@anc-care.org",
      city: "Pittsburgh",
      state: "PA",
      weeklyCapacityHours: 25,
      joinedDate: "2026-02-10",
      screeningDetails: {
        sessionId: "AI-VOICE-SES-89004",
        completedAt: "2026-02-10 16:40",
        operatorReviewStatus: "Pending Operator Review",
        overallScore: 3.8,
        strengths: ["High enthusiasm for companionship care and ADLs"],
        potentialConcerns: [
          "Incomplete details on mechanical lift transfer experience"
        ],
        reviewItems: [
          "Operator verification required: verify Hoyer lift credential before pairing with mobility-compromised patients"
        ],
        caregiverPreferences: {
          preferredHours: "Flexible Part-Time",
          preferredShifts: ["Afternoons"],
          maxCommuteMiles: 10,
          preferredLocations: ["Hill District", "Oakland", "Downtown"]
        }
      }
    },
    {
      id: "CG-2026-108",
      name: "Robert O'Connor, RN",
      qualification: "Registered Nurse (RN)",
      zipCode: "15228",
      serviceArea: "South Hills (Mt. Lebanon)",
      availability: "Available",
      screening: "Pending",
      status: "Under Review",
      matchingEligibility: "Not Eligible",
      activeCertifications: ["BLS", "ACLS", "PCCN"],
      yearsExperience: 7,
      isSmoker: true,
      phone: "(412) 555-0131",
      email: "r.oconnor@anc-care.org",
      city: "Pittsburgh",
      state: "PA",
      weeklyCapacityHours: 30,
      joinedDate: "2026-03-01"
    },
    {
      id: "CG-2026-109",
      name: "Fatima Al-Mansoor, HHA",
      qualification: "Home Health Aide (HHA)",
      zipCode: "15210",
      serviceArea: "South Side / Carrick",
      availability: "Unavailable",
      screening: "Completed",
      status: "Inactive",
      matchingEligibility: "Not Eligible",
      voiceScreeningScore: 4.7,
      activeCertifications: ["HHA Certified", "CPR"],
      yearsExperience: 5,
      isSmoker: false,
      phone: "(412) 555-0155",
      email: "f.almansoor@anc-care.org",
      city: "Pittsburgh",
      state: "PA",
      weeklyCapacityHours: 0,
      joinedDate: "2023-07-19"
    },
    {
      id: "CG-2026-110",
      name: "Tyler Bennett, PT",
      qualification: "Physical Therapist (PT)",
      zipCode: "15202",
      serviceArea: "Bellevue / Avalon",
      availability: "Available",
      screening: "Not Started",
      status: "Under Review",
      matchingEligibility: "Requires Review",
      activeCertifications: ["Physical Therapy License (PA)", "CPR"],
      yearsExperience: 3,
      isSmoker: false,
      phone: "(412) 555-0168",
      email: "t.bennett@anc-care.org",
      city: "Pittsburgh",
      state: "PA",
      weeklyCapacityHours: 20,
      joinedDate: "2026-03-05"
    }
  ];
  
  const STORAGE_KEY = "anc_caregiver_directory_records";
  
  export function getStoredCaregivers(): CaregiverDirectoryRecord[] {
    if (typeof window === "undefined") {
      return BASE_CAREGIVER_RECORDS;
    }
  
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(BASE_CAREGIVER_RECORDS));
      return BASE_CAREGIVER_RECORDS;
    }
  
    try {
      return JSON.parse(raw);
    } catch {
      return BASE_CAREGIVER_RECORDS;
    }
  }
  
  export function saveStoredCaregivers(records: CaregiverDirectoryRecord[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
  
  export function getCaregiverById(id: string): CaregiverDirectoryRecord | null {
    const records = getStoredCaregivers();
    const match = records.find((c) => c.id.toLowerCase() === id.toLowerCase());
    if (!match) return null;
  
    // Dynamically attach assignments from validated Cases Overview store
    const storedCases = getStoredCases();
    const validatedCasesForCg = storedCases
      .filter(
        (c) =>
          c.status === "Validated" &&
          c.validationDecision?.selectedCaregiverId &&
          c.validationDecision.selectedCaregiverId.toLowerCase() === id.toLowerCase()
      )
      .map((c) => ({
        caseId: c.id,
        patientName: c.patientName,
        careRequirement: `${c.disciplineNeeded} • ${c.hoursPerWeek} hrs/wk`,
        assignmentDate: c.validationDecision?.validatedAt || new Date().toISOString().substring(0, 10),
        status: "Active" as const,
        validationType: "Human Validated" as const,
        matchScore: c.matchResults?.shortlist?.[0]?.overallScore || 95,
        outcomeNotes: c.clinicalDirectives || "Validated care placement.",
      }));
  
    const existingAssignments = match.assignments || [];
    const mergedMap = new Map<string, typeof existingAssignments[0]>();
    existingAssignments.forEach((a) => mergedMap.set(a.caseId, a));
    validatedCasesForCg.forEach((a) => mergedMap.set(a.caseId, a));
  
    return {
      ...match,
      assignments: Array.from(mergedMap.values()),
    };
  }
  
  export function updateCaregiverRecord(updatedRecord: CaregiverDirectoryRecord): void {
    const records = getStoredCaregivers();
    const index = records.findIndex((c) => c.id.toLowerCase() === updatedRecord.id.toLowerCase());
    if (index !== -1) {
      records[index] = updatedRecord;
    } else {
      records.push(updatedRecord);
    }
    saveStoredCaregivers(records);
  }
  
  export function computeCaregiverMetrics(records: CaregiverDirectoryRecord[]): CaregiverDirectoryMetrics {
    return {
      total: records.length,
      available: records.filter((r) => r.availability === "Available" && r.status === "Active").length,
      onAssignment: records.filter((r) => r.status === "On Assignment").length,
      underReview: records.filter((r) => r.status === "Under Review" || r.screening === "Needs Review").length,
    };
  }