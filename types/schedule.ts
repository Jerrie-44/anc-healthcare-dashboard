// types/schedule.ts
export interface ScheduledVisit {
    id: string;
    referralId: string;
    patientName: string;
    patientAddress: string;
    clinicianId: string;
    clinicianName: string;
    discipline: string;
    serviceType: string;
    date: string; // YYYY-MM-DD
    timeSlot: string; // e.g. "09:00 AM - 10:15 AM"
    status: "Confirmed" | "In-Transit" | "Completed" | "Pending Confirmation";
    priority: "Urgent" | "High" | "Standard";
  }
  
  export const MOCK_SCHEDULED_VISITS: ScheduledVisit[] = [
    {
      id: "VST-101",
      referralId: "REF-9021",
      patientName: "Harold Jenkins",
      patientAddress: "742 Evergreen Terr, Zone 2",
      clinicianId: "CLN-104",
      clinicianName: "Sarah Chen, RN-WCC",
      discipline: "Wound Care Nurse",
      serviceType: "Wound Debridement & Vac Therapy",
      date: "2026-10-30",
      timeSlot: "09:00 AM - 10:00 AM",
      status: "Confirmed",
      priority: "Urgent",
    },
    {
      id: "VST-102",
      referralId: "REF-8041",
      patientName: "Mary Smith",
      patientAddress: "124 Baker St, Zone 1",
      clinicianId: "CLN-309",
      clinicianName: "Elena Rostova, DPT",
      discipline: "Physical Therapist",
      serviceType: "Post-Op Knee ROM & Gait Evaluation",
      date: "2026-10-30",
      timeSlot: "10:30 AM - 11:30 AM",
      status: "In-Transit",
      priority: "High",
    },
    {
      id: "VST-103",
      referralId: "REF-8042",
      patientName: "John Doe",
      patientAddress: "88 Pinecrest Ave, Zone 3",
      clinicianId: "CLN-218",
      clinicianName: "Marcus Vance, BSN",
      discipline: "Wound Care Nurse",
      serviceType: "Sacral Pressure Ulcer Dressing Change",
      date: "2026-10-30",
      timeSlot: "01:00 PM - 02:00 PM",
      status: "Confirmed",
      priority: "Standard",
    },
    {
      id: "VST-104",
      referralId: "REF-8044",
      patientName: "Robert Green",
      patientAddress: "404 Elm St, Zone 2",
      clinicianId: "CLN-412",
      clinicianName: "David O'Connor, RN",
      discipline: "Home Health RN",
      serviceType: "Post-Surgical Stoma Assessment",
      date: "2026-10-31",
      timeSlot: "09:30 AM - 10:30 AM",
      status: "Pending Confirmation",
      priority: "High",
    },
    {
      id: "VST-105",
      referralId: "REF-8045",
      patientName: "Clara Oswald",
      patientAddress: "12 Meadow Lane, Zone 4",
      clinicianId: "CLN-505",
      clinicianName: "Amina Al-Mansoor, OTR/L",
      discipline: "Occupational Therapist",
      serviceType: "Home Safety Assessment & ADL Training",
      date: "2026-10-31",
      timeSlot: "02:00 PM - 03:00 PM",
      status: "Confirmed",
      priority: "Standard",
    },
  ];
  