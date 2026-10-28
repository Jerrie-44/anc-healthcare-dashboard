// types/referral.ts

export type TriageStage = "Ready for Matching" | "Pending Review" | "Matched" | "On Hold";
export type ExtractionStatus = "Extracted" | "Processing" | "Needs Review";
export type PriorityLevel = "Urgent" | "High" | "Standard";

export interface Referral {
  id: string;
  patientName: string;
  dob: string;
  primaryCondition: string;
  priority: PriorityLevel;
  extractionStatus: ExtractionStatus;
  triageStage: TriageStage;
  referringProvider: string;
  receivedDate: string;
}

export const MOCK_REFERRALS: Referral[] = [
  {
    id: "REF-8041",
    patientName: "Mary Smith",
    dob: "1954-06-12",
    primaryCondition: "Post-Op Knee Replacement",
    priority: "Urgent",
    extractionStatus: "Extracted",
    triageStage: "Ready for Matching",
    referringProvider: "St. Jude Memorial Hospital",
    receivedDate: "2026-10-28",
  },
  {
    id: "REF-8042",
    patientName: "John Doe",
    dob: "1968-11-03",
    primaryCondition: "Wound Care & Dressing Management",
    priority: "High",
    extractionStatus: "Extracted",
    triageStage: "Pending Review",
    referringProvider: "Evergreen Health Clinic",
    receivedDate: "2026-10-28",
  },
  {
    id: "REF-8043",
    patientName: "Eleanor Vance",
    dob: "1942-02-18",
    primaryCondition: "Congestive Heart Failure Monitoring",
    priority: "Standard",
    extractionStatus: "Needs Review",
    triageStage: "Pending Review",
    referringProvider: "Metro Cardiology Center",
    receivedDate: "2026-10-27",
  },
  {
    id: "REF-8044",
    patientName: "Arthur Pendelton",
    dob: "1975-09-24",
    primaryCondition: "Physical Therapy / Stroke Rehab",
    priority: "Urgent",
    extractionStatus: "Extracted",
    triageStage: "Ready for Matching",
    referringProvider: "Mercy General",
    receivedDate: "2026-10-27",
  },
  {
    id: "REF-8045",
    patientName: "Clara Higgins",
    dob: "1983-04-05",
    primaryCondition: "PICC Line Maintenance",
    priority: "Standard",
    extractionStatus: "Extracted",
    triageStage: "Matched",
    referringProvider: "Pacific Infusion Clinic",
    receivedDate: "2026-10-26",
  },
  {
    id: "REF-8046",
    patientName: "David Miller",
    dob: "1960-08-30",
    primaryCondition: "Diabetic Neuropathy Education",
    priority: "Standard",
    extractionStatus: "Processing",
    triageStage: "On Hold",
    referringProvider: "Valley Medical Associates",
    receivedDate: "2026-10-26",
  },
];