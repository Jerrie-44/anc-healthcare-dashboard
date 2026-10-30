// app/(dashboard)/clinicians/[id]/page.tsx
"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_CLINICIANS, Clinician } from "@/types/clinician";
import { MOCK_REFERRALS } from "@/types/referral";
import { Breadcrumb, BreadcrumbItem } from "@/components/base/breadcrumb/breadcrumb";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClinicianProfilePage({ params }: PageProps) {
  const { id } = use(params);

  const clinician = useMemo<Clinician | null>(() => {
    return (
      MOCK_CLINICIANS.find((c) => c.id.toLowerCase() === id.toLowerCase()) || null
    );
  }, [id]);

  if (!clinician) {
    notFound();
  }

  // Active cases assigned to this clinician or related discipline
  const assignedCases = useMemo(() => {
    return MOCK_REFERRALS.slice(0, 3);
  }, []);

  const [activeTab, setActiveTab] = useState<"caseload" | "credentials">("caseload");

  const usagePercent = Math.round(
    (clinician.activeCaseload / clinician.maxCaseload) * 100
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8fafc] p-6 lg:p-10 animate-fade-in">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6">

        {/* BoardUI Breadcrumbs */}
        <Breadcrumb aria-label="Clinician Profile Navigation">
          <BreadcrumbItem href="/referrals">Dashboard</BreadcrumbItem>
          <BreadcrumbItem href="/clinicians">Clinician Roster</BreadcrumbItem>
          <BreadcrumbItem current>{clinician.name}</BreadcrumbItem>
        </Breadcrumb>

        {/* Profile Header (Clean - No container card, fill color, or shadow) */}
        <div className="flex flex-col justify-between gap-6 py-2 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            {/* Avatar Pill */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px] bg-blue-50 font-bold text-xl text-[#007aff]">
              {clinician.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-display-4-medium tracking-tight text-text-primary">
                  {clinician.name}
                </h1>
                <span className="font-mono text-body-2-medium text-text-secondary">
                  ({clinician.id})
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${
                    clinician.availability === "Immediate"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : clinician.availability === "Within 48h"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {clinician.availability}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-body-2-regular text-text-secondary">
                <span className="font-medium text-text-primary">
                  {clinician.discipline}
                </span>
                <span>&bull;</span>
                <span>Coverage: {clinician.coverageZone}</span>
                <span>&bull;</span>
                <span className="font-medium text-text-primary">
                  ★ {clinician.rating} Rating
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={`tel:${clinician.phone}`}
              className="rounded-[10px] border border-[#d0d5dd] bg-white px-4 py-2.5 text-body-2-medium text-[#344054] shadow-xs transition hover:bg-[#f9fafb]"
            >
              Call Provider
            </a>
            <Link
              href="/schedule"
              className="rounded-[10px] bg-[#007aff] px-4 py-2.5 text-body-2-medium font-medium text-white shadow-xs transition hover:bg-[#0062cc]"
            >
              Schedule Visit &rarr;
            </Link>
          </div>
        </div>

        {/* 3-Column Top Metric Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1 rounded-[10px] border border-[#eaecf0] bg-white p-5 shadow-xs">
            <span className="text-caption-1-medium text-text-tertiary">
              Active Patient Load
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-display-3-bold text-text-primary">
                {clinician.activeCaseload}
              </span>
              <span className="text-caption-1-regular text-text-secondary">
                / {clinician.maxCaseload} max capacity
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  usagePercent >= 90
                    ? "bg-rose-500"
                    : usagePercent >= 75
                    ? "bg-amber-500"
                    : "bg-[#007aff]"
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 rounded-[10px] border border-[#eaecf0] bg-white p-5 shadow-xs">
            <span className="text-caption-1-medium text-text-tertiary">
              Available Intake Slots
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-display-3-bold text-emerald-700">
                {Math.max(0, clinician.maxCaseload - clinician.activeCaseload)}
              </span>
              <span className="text-caption-1-regular text-text-secondary">
                open case slots
              </span>
            </div>
            <span className="mt-2 text-caption-1-regular text-emerald-600 font-medium">
              Accepting urgent triage dispatches
            </span>
          </div>

          <div className="flex flex-col gap-1 rounded-[10px] border border-[#eaecf0] bg-white p-5 shadow-xs">
            <span className="text-caption-1-medium text-text-tertiary">
              Compliance & Credential Status
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-display-3-bold text-text-primary">
                100%
              </span>
              <span className="text-caption-1-regular text-emerald-600 font-medium">
                Verified
              </span>
            </div>
            <span className="mt-2 text-caption-1-regular text-text-secondary">
              Next re-attestation: 2027-04-15
            </span>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex items-center gap-2 border-b border-[#eaecf0] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("caseload")}
            className={`rounded-[10px] px-4 py-2 text-body-2-medium transition ${
              activeTab === "caseload"
                ? "bg-[#007aff] text-white shadow-xs"
                : "border border-[#eaecf0] bg-white text-text-secondary hover:bg-slate-50 hover:text-text-primary"
            }`}
          >
            Active Caseload ({assignedCases.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("credentials")}
            className={`rounded-[10px] px-4 py-2 text-body-2-medium transition ${
              activeTab === "credentials"
                ? "bg-[#007aff] text-white shadow-xs"
                : "border border-[#eaecf0] bg-white text-text-secondary hover:bg-slate-50 hover:text-text-primary"
            }`}
          >
            Certifications &amp; Credentials ({clinician.credentials.length})
          </button>
        </div>

        {/* Tab 1: Caseload */}
        {activeTab === "caseload" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-semibold text-text-primary">
                Current Assigned Referrals
              </h2>
              <span className="text-caption-1-regular text-text-tertiary">
                Cases requiring active care management
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {assignedCases.map((patient) => (
                <div
                  key={patient.id}
                  className="flex flex-col justify-between gap-4 rounded-[10px] border border-[#eaecf0] bg-white p-5 shadow-xs transition hover:border-[#b2d5ff] sm:flex-row sm:items-center"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-body-medium font-semibold text-text-primary">
                        {patient.patientName}
                      </span>
                      <span className="font-mono text-caption-1-medium text-text-tertiary">
                        ({patient.id})
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          patient.priority === "Urgent"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {patient.priority}
                      </span>
                    </div>

                    <p className="text-body-2-regular text-text-secondary">
                      {patient.primaryCondition}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 text-caption-1-regular text-text-tertiary">
                      <span>Source: {patient.referringProvider}</span>
                      <span>&bull;</span>
                      <span>DOB: {patient.dob}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/referrals/${patient.id}`}
                      className="rounded-[10px] border border-[#d0d5dd] bg-white px-3.5 py-1.5 text-body-2-medium text-[#344054] shadow-xs transition hover:bg-[#f9fafb]"
                    >
                      View Case Profile &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Certifications & Credentials */}
        {activeTab === "credentials" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-semibold text-text-primary">
                Active Licenses &amp; Clinical Accreditations
              </h2>
              <span className="text-caption-1-regular text-emerald-600 font-medium">
                Verified through State Board of Nursing
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clinician.credentials.map((cred) => (
                <div
                  key={cred}
                  className="flex flex-col gap-3 rounded-[10px] border border-[#eaecf0] bg-white p-5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-[6px] bg-blue-50 px-2.5 py-1 font-mono text-body-2-bold font-bold text-[#007aff]">
                      {cred}
                    </span>
                    <span className="text-caption-1-bold text-emerald-700">
                      ACTIVE
                    </span>
                  </div>

                  <div>
                    <div className="text-body-2-medium text-text-primary">
                      {cred === "WCC"
                        ? "Wound Care Certified Specialist"
                        : cred === "RN"
                        ? "Registered Professional Nurse"
                        : cred === "CWCN"
                        ? "Certified Wound Care Nurse"
                        : cred === "BLS"
                        ? "Basic Life Support (AHA)"
                        : "Clinical Practice License"}
                    </div>
                    <div className="mt-1 text-caption-1-regular text-text-tertiary">
                      License # RN-8849201 &bull; Issued by State Board
                    </div>
                  </div>

                  <div className="border-t border-[#eaecf0] pt-2 text-caption-2-regular text-text-secondary">
                    Renewal Due: October 2027
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}