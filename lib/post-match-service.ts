// lib/post-match-service.ts
import {
    PostMatchRecord,
    ProcessingReadinessStatus,
    RequirementItemStatus,
    DocumentReviewStatus,
  } from "@/types/post-match";
  import { MOCK_CASES_DB } from "@/lib/referral-service";
  
  export const MOCK_POST_MATCH_DB: PostMatchRecord[] = [
    {
      id: "PMP-701",
      caseId: "REF-4091",
      patientName: "Elena Rostova",
      patientZip: "15213",
      caregiverId: "CG-8012",
      caregiverName: "Elena V. Rostova",
      caregiverDiscipline: "Wound Care Certified Nurse (RN-WCC)",
      caregiverPhone: "(412) 555-0192",
      matchScore: 98,
      matchRank: 1,
      matchingRationale: "Proximity 3.4 miles, Active PA RN-WCC license, NPWT experience.",
      validatedProfileVersion: 1,
      placementId: "PLC-601",
  
      processingStatus: "Ready for Placement",
      credentialingStatus: "Verified",
      complianceStatus: "Compliant",
      readinessStatus: "Ready for Placement",
  
      assignedOperator: "Dr. R. Sterling",
      dateEntered: "2026-11-04 10:30",
      lastUpdated: "2026-11-04 11:25",
  
      requirements: [
        {
          id: "req-701-1",
          processingId: "PMP-701",
          name: "Case NPWT Negative Pressure Wound Therapy Verification",
          category: "Assignment-Specific Credentialing",
          scope: "Assignment-Specific",
          description: "Verify bedside NPWT canister drainage protocol and dressing renewal competency for surgical stasis ulcers.",
          status: "Verified",
          assignedTo: "Dr. R. Sterling",
          supportingDocIds: ["doc-p-1"],
          verifiedBy: "Dr. R. Sterling",
          verifiedAt: "2026-11-04 11:00",
          completionDate: "2026-11-04",
        },
        {
          id: "req-701-2",
          processingId: "PMP-701",
          name: "Patient Neighborhood Commute & Zone Clearance",
          category: "Assignment-Specific Compliance",
          scope: "Assignment-Specific",
          description: "Confirm willingness and transport reliability for Oakland/Shadyside ZIP 15213 for 18h weekly authorized visits.",
          status: "Verified",
          assignedTo: "Dr. R. Sterling",
          supportingDocIds: [],
          verifiedBy: "Dr. R. Sterling",
          verifiedAt: "2026-11-04 11:15",
          completionDate: "2026-11-04",
        },
        {
          id: "req-701-3",
          processingId: "PMP-701",
          name: "Pre-Deployment Clinical Protocol Sign-off",
          category: "Human Review and Verification",
          scope: "Assignment-Specific",
          description: "Clinical dispatcher sign-off on infection control and sterile wound field maintenance.",
          status: "Verified",
          assignedTo: "Dr. R. Sterling",
          supportingDocIds: ["doc-p-1"],
          verifiedBy: "Dr. R. Sterling",
          verifiedAt: "2026-11-04 11:20",
          completionDate: "2026-11-04",
        },
      ],
      documents: [
        {
          id: "doc-p-1",
          processingId: "PMP-701",
          caregiverId: "CG-8012",
          documentName: "PA_State_Board_RN_License.pdf",
          category: "State Board License",
          submissionDate: "2026-11-02",
          uploadedBy: "Elena V. Rostova",
          reviewStatus: "Verified",
          reviewedBy: "Dr. R. Sterling",
          reviewedAt: "2026-11-04 11:00",
          expiryDate: "2027-10-31",
          version: 1,
        },
      ],
      exceptions: [],
      auditLogs: [
        {
          id: "log-p-101",
          timestamp: "2026-11-04 10:30",
          actor: "System Dispatch Engine",
          action: "Post-Match Record Initialized",
          details: "Assigned candidate Elena V. Rostova (Rank #1) for REF-4091 post-match validation.",
        },
        {
          id: "log-p-102",
          timestamp: "2026-11-04 11:25",
          actor: "Dr. R. Sterling",
          action: "Human Verification Completed",
          details: "Marked all case requirements verified. Ready for official placement transition.",
        },
      ],
    },
    {
      id: "PMP-702",
      caseId: "REF-4093",
      patientName: "Charles Danvers",
      patientZip: "15206",
      caregiverId: "CG-8013",
      caregiverName: "Marcus Brody",
      caregiverDiscipline: "Physical Therapist (PT)",
      caregiverPhone: "(412) 555-7741",
      matchScore: 92,
      matchRank: 1,
      matchingRationale: "Neuro-rehabilitation specialty, 8 years direct care, proximity 4.2 miles.",
      validatedProfileVersion: 1,
  
      processingStatus: "Awaiting Review",
      credentialingStatus: "Awaiting Review",
      complianceStatus: "Pending Verification",
      readinessStatus: "Ready for Human Review",
  
      assignedOperator: "Dr. R. Sterling",
      dateEntered: "2026-11-05 12:00",
      lastUpdated: "2026-11-05 14:10",
  
      requirements: [
        {
          id: "req-702-1",
          processingId: "PMP-702",
          name: "Post-Stroke Gait & Transfer Endorsement",
          category: "Assignment-Specific Credentialing",
          scope: "Assignment-Specific",
          description: "Review Physical Therapy board license and verified neuro-rehab clinical record.",
          status: "Awaiting Review",
          assignedTo: "Dr. R. Sterling",
          supportingDocIds: ["doc-p-2"],
        },
        {
          id: "req-702-2",
          processingId: "PMP-702",
          name: "BLS / CPR Card Expiration Verification",
          category: "Assignment-Specific Compliance",
          scope: "General",
          description: "Verify expiration date on AHA card submitted during onboarding intake.",
          status: "Requires Clarification",
          assignedTo: "Dr. R. Sterling",
          supportingDocIds: ["doc-p-3"],
          notes: "Uploaded card image is blurry; expiration year unreadable.",
        },
      ],
      documents: [
        {
          id: "doc-p-2",
          processingId: "PMP-702",
          caregiverId: "CG-8013",
          documentName: "PA_PT_License_Brody.pdf",
          category: "State Board License",
          submissionDate: "2026-11-05",
          uploadedBy: "Marcus Brody",
          reviewStatus: "Under Review",
          version: 1,
        },
        {
          id: "doc-p-3",
          processingId: "PMP-702",
          caregiverId: "CG-8013",
          documentName: "cpr_card_photo.jpg",
          category: "BLS / CPR Certification",
          submissionDate: "2026-11-05",
          uploadedBy: "Marcus Brody",
          reviewStatus: "Requires Resubmission",
          reviewedBy: "Dr. R. Sterling",
          rejectionReason: "Photo blurred; license year illegible.",
          version: 1,
        },
      ],
      exceptions: [
        {
          id: "PME-401",
          processingId: "PMP-702",
          caseId: "REF-4093",
          caregiverId: "CG-8013",
          category: "Document Clarification Required",
          description: "CPR credential card requires high-resolution resubmission prior to placement.",
          status: "Open",
          assignedOperator: "Dr. R. Sterling",
          detectedAt: "2026-11-05 14:10",
        },
      ],
      auditLogs: [
        {
          id: "log-p-103",
          timestamp: "2026-11-05 12:00",
          actor: "Dr. R. Sterling",
          action: "Post-Match Record Created",
          details: "Assigned candidate Marcus Brody to REF-4093 post-match verification desk.",
        },
      ],
    },
    {
      id: "PMP-703",
      caseId: "REF-4095",
      patientName: "Harold Jenkins",
      patientZip: "15222",
      caregiverId: "CG-8014",
      caregiverName: "Amina Al-Mansoor",
      caregiverDiscipline: "Home Health Aide (HHA)",
      caregiverPhone: "(412) 555-9014",
      matchScore: 88,
      matchRank: 1,
      matchingRationale: "Dementia care focus, certified in ADL transfer assist.",
      validatedProfileVersion: 1,
  
      processingStatus: "Awaiting Documentation",
      credentialingStatus: "Awaiting Documentation",
      complianceStatus: "Requires Clarification",
      readinessStatus: "Blocked",
  
      assignedOperator: "Dr. R. Sterling",
      dateEntered: "2026-11-06 08:30",
      lastUpdated: "2026-11-06 09:15",
  
      requirements: [
        {
          id: "req-703-1",
          processingId: "PMP-703",
          name: "TB Screen / 2-Step PPD Clearance",
          category: "Assignment-Specific Compliance",
          scope: "Assignment-Specific",
          description: "Annual PPD test verification within past 12 months for congregate or home visits.",
          status: "Awaiting Documentation",
          assignedTo: "Dr. R. Sterling",
          supportingDocIds: [],
          notes: "Caregiver notified via portal notification to upload recent TB test results.",
        },
      ],
      documents: [],
      exceptions: [
        {
          id: "PME-402",
          processingId: "PMP-703",
          caseId: "REF-4095",
          caregiverId: "CG-8014",
          category: "Missing Credential",
          description: "Annual TB test result documentation missing.",
          status: "Open",
          assignedOperator: "Dr. R. Sterling",
          detectedAt: "2026-11-06 08:45",
        },
      ],
      auditLogs: [
        {
          id: "log-p-104",
          timestamp: "2026-11-06 08:30",
          actor: "System Dispatch Engine",
          action: "Post-Match Record Initialized",
          details: "Candidate Amina Al-Mansoor assigned for REF-4095 clinical intake review.",
        },
      ],
    },
  ];
  
  export function getPostMatchById(id: string): PostMatchRecord | undefined {
    return MOCK_POST_MATCH_DB.find((p) => p.id.toLowerCase() === id.toLowerCase());
  }
  
  export function computeReadiness(record: PostMatchRecord): ProcessingReadinessStatus {
    // If unresolved open or escalated exceptions exist, placement progression is blocked
    if (record.exceptions.some((e) => e.status === "Open" || e.status === "Escalated")) {
      return "Blocked";
    }
  
    // All requirements must be verified or marked Not Applicable by human decision
    const allVerified = record.requirements.every(
      (r) => r.status === "Verified" || r.status === "Not Applicable"
    );
  
    if (allVerified && record.requirements.length > 0) {
      return "Ready for Placement";
    }
  
    const hasAwaitingReview = record.requirements.some(
      (r) => r.status === "Awaiting Review" || r.status === "Submitted"
    );
  
    if (hasAwaitingReview) {
      return "Ready for Human Review";
    }
  
    return "Not Ready";
  }