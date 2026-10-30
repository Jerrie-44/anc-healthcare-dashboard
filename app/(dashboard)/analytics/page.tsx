// app/(dashboard)/analytics/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem } from "@/components/base/breadcrumb/breadcrumb";
import { StatCards } from "@/components/application/dashboard/stat-cards";

export default function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const funnelStages = [
    { name: "Total Referrals Ingested", count: 148, percent: 100, color: "bg-slate-400" },
    { name: "AI Entities Verified", count: 142, percent: 96, color: "bg-blue-400" },
    { name: "Clinician Matched", count: 128, percent: 86, color: "bg-[#007aff]" },
    { name: "Field Visit Dispatched", count: 114, percent: 77, color: "bg-emerald-500" },
  ];

  const disciplineBreakdown = [
    { name: "Wound Care (RN-WCC / CWCN)", count: 58, percent: 45, color: "bg-[#007aff]" },
    { name: "Physical Therapy (DPT)", count: 34, percent: 27, color: "bg-indigo-500" },
    { name: "General Home Health RN", count: 24, percent: 19, color: "bg-emerald-500" },
    { name: "Occupational Therapy (OTR/L)", count: 12, percent: 9, color: "bg-amber-500" },
  ];

  const regionalZones = [
    { zone: "Metro Central (Zone 1)", activePatients: 46, providerCount: 6, saturation: "Optimal (74%)" },
    { zone: "South County (Zone 2)", activePatients: 38, providerCount: 4, saturation: "High (89%)" },
    { zone: "North Sector (Zone 3)", activePatients: 29, providerCount: 5, saturation: "Optimal (65%)" },
    { zone: "East Valley (Zone 4)", activePatients: 21, providerCount: 3, saturation: "Optimal (68%)" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8fafc] p-6 lg:p-10 animate-fade-in">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6">

        {/* BoardUI Breadcrumbs */}
        <Breadcrumb aria-label="Analytics Navigation">
          <BreadcrumbItem href="/referrals">Dashboard</BreadcrumbItem>
          <BreadcrumbItem current>Analytics &amp; Operations</BreadcrumbItem>
        </Breadcrumb>

        {/* Header - Unboxed & Clean */}
        <div className="flex flex-col justify-between gap-4 py-2 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-display-4-medium tracking-tight text-text-primary">
              Operations &amp; Triage Analytics
            </h1>
            <p className="mt-1 text-body-2-regular text-text-secondary max-w-3xl">
              Real-time reporting on patient intake velocity, clinical match latency, and regional network capacity.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`rounded-[10px] px-3.5 py-2 text-body-2-medium transition ${
                  timeRange === range
                    ? "bg-[#007aff] text-white shadow-xs"
                    : "border border-[#d0d5dd] bg-white text-[#344054] hover:bg-slate-50"
                }`}
              >
                {range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : "Last Quarter"}
              </button>
            ))}
          </div>
        </div>

        {/* BoardUI StatCards Metric Tiles */}
        <StatCards variant="footer" />

        {/* 2-Column Section: Intake Pipeline Funnel vs Care Discipline Distribution */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Intake Conversion Funnel */}
          <div className="flex flex-col gap-5 rounded-[10px] border border-[#eaecf0] bg-white p-6 shadow-xs">
            <div>
              <h2 className="text-headline-semibold text-text-primary">
                Triage Pipeline Throughput
              </h2>
              <p className="mt-0.5 text-body-2-regular text-text-secondary">
                Progress from inbound clinic referral packet to verified home visit dispatch.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {funnelStages.map((stage) => (
                <div key={stage.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-body-2-medium">
                    <span className="text-text-primary">{stage.name}</span>
                    <span className="text-text-secondary">
                      {stage.count} <span className="text-text-tertiary">({stage.percent}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                      style={{ width: `${stage.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 border-t border-[#eaecf0] pt-4 text-caption-1-regular text-text-tertiary flex items-center justify-between">
              <span>96.4% entity extraction success rate</span>
              <Link href="/referrals" className="text-[#007aff] font-medium hover:underline">
                View Queue &rarr;
              </Link>
            </div>
          </div>

          {/* Care Discipline Distribution */}
          <div className="flex flex-col gap-5 rounded-[10px] border border-[#eaecf0] bg-white p-6 shadow-xs">
            <div>
              <h2 className="text-headline-semibold text-text-primary">
                Discipline Demand Mix
              </h2>
              <p className="mt-0.5 text-body-2-regular text-text-secondary">
                Clinical services requested across all verified active admissions.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {disciplineBreakdown.map((item) => (
                <div key={item.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-body-2-medium">
                    <span className="text-text-primary">{item.name}</span>
                    <span className="text-text-secondary font-mono">
                      {item.count} cases ({item.percent}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 border-t border-[#eaecf0] pt-4 text-caption-1-regular text-text-tertiary flex items-center justify-between">
              <span>Wound Care represents the highest clinical load</span>
              <Link href="/clinicians" className="text-[#007aff] font-medium hover:underline">
                View Staffing &rarr;
              </Link>
            </div>
          </div>

        </div>

        {/* Regional Zone Coverage & Saturation Table */}
        <div className="flex flex-col gap-4 rounded-[10px] border border-[#eaecf0] bg-white p-6 shadow-xs">
          <div>
            <h2 className="text-headline-semibold text-text-primary">
              Regional Field Density &amp; Saturation
            </h2>
            <p className="mt-0.5 text-body-2-regular text-text-secondary">
              Travel zones mapped against active patient density and clinician allocation.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#eaecf0] text-caption-1-medium text-text-tertiary">
                  <th className="py-3 px-4 font-semibold">Territory Zone</th>
                  <th className="py-3 px-4 font-semibold">Active Patients</th>
                  <th className="py-3 px-4 font-semibold">Allocated Clinicians</th>
                  <th className="py-3 px-4 font-semibold">Field Saturation</th>
                  <th className="py-3 px-4 font-semibold text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaecf0] text-body-2-regular text-text-primary">
                {regionalZones.map((row) => (
                  <tr key={row.zone} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-medium">{row.zone}</td>
                    <td className="py-3.5 px-4 font-mono">{row.activePatients}</td>
                    <td className="py-3.5 px-4 font-mono">{row.providerCount} clinicians</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          row.saturation.includes("High")
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {row.saturation}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/schedule"
                        className="text-body-2-medium text-[#007aff] hover:underline"
                      >
                        View Route &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}