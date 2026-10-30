// types/clinician.ts
export interface Clinician {
    id: string;
    name: string;
    discipline: string;
    credentials: string[];
    matchScore: number;
    distanceMiles: number;
    availability: "Immediate" | "Within 48h" | "Next Week";
    activeCaseload: number;
    maxCaseload: number;
    rating: number;
    languages: string[];
    phone?: string;
    email?: string;
    coverageZone?: string;
  }
  
  export const MOCK_CLINICIANS: Clinician[] = [
    {
      id: "CLN-104",
      name: "Sarah Chen, RN-WCC",
      discipline: "Wound Care Certified Nurse",
      credentials: ["RN", "WCC", "BLS"],
      matchScore: 98,
      distanceMiles: 3.2,
      availability: "Immediate",
      activeCaseload: 14,
      maxCaseload: 20,
      rating: 4.9,
      languages: ["English", "Mandarin"],
      phone: "(555) 234-8901",
      email: "s.chen@anc-health.org",
      coverageZone: "Metro Central (Zone 1 & 2)",
    },
    {
      id: "CLN-218",
      name: "Marcus Vance, BSN",
      discipline: "Wound Care Certified Nurse",
      credentials: ["RN", "CWCN"],
      matchScore: 91,
      distanceMiles: 5.8,
      availability: "Immediate",
      activeCaseload: 18,
      maxCaseload: 22,
      rating: 4.8,
      languages: ["English"],
      phone: "(555) 345-6712",
      email: "m.vance@anc-health.org",
      coverageZone: "North Sector (Zone 3)",
    },
    {
      id: "CLN-309",
      name: "Elena Rostova, DPT",
      discipline: "Physical Therapist",
      credentials: ["PT", "DPT", "GCS"],
      matchScore: 84,
      distanceMiles: 8.1,
      availability: "Within 48h",
      activeCaseload: 12,
      maxCaseload: 18,
      rating: 4.9,
      languages: ["English", "Russian"],
      phone: "(555) 890-1234",
      email: "e.rostova@anc-health.org",
      coverageZone: "East Valley (Zone 4)",
    },
    {
      id: "CLN-412",
      name: "David O'Connor, RN",
      discipline: "Home Health Registered Nurse",
      credentials: ["RN", "IV Certified"],
      matchScore: 78,
      distanceMiles: 11.4,
      availability: "Within 48h",
      activeCaseload: 19,
      maxCaseload: 20,
      rating: 4.7,
      languages: ["English", "Spanish"],
      phone: "(555) 678-9012",
      email: "d.oconnor@anc-health.org",
      coverageZone: "South County (Zone 2 & 5)",
    },
    {
      id: "CLN-505",
      name: "Amina Al-Mansoor, OTR/L",
      discipline: "Occupational Therapist",
      credentials: ["OTR/L", "CHT"],
      matchScore: 88,
      distanceMiles: 4.6,
      availability: "Immediate",
      activeCaseload: 10,
      maxCaseload: 16,
      rating: 5.0,
      languages: ["English", "Arabic"],
      phone: "(555) 789-2345",
      email: "a.almansoor@anc-health.org",
      coverageZone: "Metro Central (Zone 1)",
    },
    {
      id: "CLN-611",
      name: "Gregory Hayes, NP-C",
      discipline: "Nurse Practitioner",
      credentials: ["FNP-C", "MSN", "AGACNP"],
      matchScore: 94,
      distanceMiles: 7.0,
      availability: "Next Week",
      activeCaseload: 21,
      maxCaseload: 22,
      rating: 4.9,
      languages: ["English"],
      phone: "(555) 456-7890",
      email: "g.hayes@anc-health.org",
      coverageZone: "Regional Mobile (Zones 1-5)",
    },
  ];