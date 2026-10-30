// app/(dashboard)/referrals/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { MOCK_REFERRALS, Referral } from "@/types/referral";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/base/table/table";
import { Pagination } from "@/components/base/pagination/pagination";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/base/segmented-control/segmented-control";
import {
  TriageBadge,
  PriorityBadge,
  ExtractionBadge,
} from "@/components/application/referrals/referral-badges";
import { IntakeModal } from "@/components/application/referrals/intake-modal";

const PAGE_SIZE = 4;

export default function ReferralsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [page, setPage] = useState(1);

  // Filter list by stage and search query
  const filteredReferrals = useMemo(() => {
    return MOCK_REFERRALS.filter((item) => {
      const matchesSearch =
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.primaryCondition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.referringProvider.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStage =
        selectedStage === "All" || item.triageStage === selectedStage;

      return matchesSearch && matchesStage;
    });
  }, [searchQuery, selectedStage]);

  // Reset to first page when filtering or searching changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedStage]);

  const totalPages = Math.max(1, Math.ceil(filteredReferrals.length / PAGE_SIZE));

  const paginatedReferrals = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredReferrals.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredReferrals, page]);

  const stages = [
    { id: "All", label: "All" },
    { id: "Ready for Matching", label: "Ready for Matching" },
    { id: "Pending Review", label: "Pending Review" },
    { id: "Matched", label: "Matched" },
    { id: "On Hold", label: "On Hold" },
  ];

  const startIndexDisplay = filteredReferrals.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndexDisplay = Math.min(page * PAGE_SIZE, filteredReferrals.length);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8fafc] p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-display-4-medium tracking-tight text-text-primary">
              Referrals & Intake
            </h1>
            <p className="mt-1 text-body-regular text-text-secondary">
              Review incoming referrals, clinical triage status, and care assignment readiness.
            </p>
          </div>

          {/* AI Intake Document Processing Modal */}
          <IntakeModal />
        </div>

        {/* Filter Controls Bar with Segmented Control */}
        <div className="flex flex-col gap-4 rounded-xl border border-[#eaecf0] bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
          {/* Search Bar */}
          <div className="relative w-full xl:max-w-xs">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, ID, or condition..."
              className="w-full rounded-lg border border-[#d0d5dd] bg-white px-3.5 py-2 text-body-2-regular text-[#101828] placeholder:text-[#667085] focus:border-[#007aff] focus:outline-none"
            />
          </div>

          {/* BoardUI SegmentedControl */}
          <div className="overflow-x-auto">
            <SegmentedControl
              aria-label="Filter referrals by triage status"
              variant="solid"
              selectedKeys={new Set([selectedStage])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                if (selected) {
                  setSelectedStage(selected);
                }
              }}
            >
              {stages.map((stage) => (
                <SegmentedControlItem key={stage.id} id={stage.id}>
                  {stage.label}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>
        </div>

        {/* BoardUI Table Shell */}
        <div className="overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
          <Table aria-label="Incoming Referrals Directory" size="md">
            <TableHeader>
              <TableColumn id="id" isRowHeader>
                Case ID
              </TableColumn>
              <TableColumn id="patient">Patient Name</TableColumn>
              <TableColumn id="condition">Primary Condition</TableColumn>
              <TableColumn id="priority">Priority</TableColumn>
              <TableColumn id="extraction">Extraction</TableColumn>
              <TableColumn id="stage">Triage Stage</TableColumn>
              <TableColumn id="actions">
                <span className="sr-only">Actions</span>
              </TableColumn>
            </TableHeader>

            <TableBody items={paginatedReferrals}>
              {(item: Referral) => (
                <TableRow key={item.id} id={item.id}>
                  <TableCell>
                    <span className="font-mono text-caption-1-medium text-text-secondary">
                      {item.id}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-text-primary">{item.patientName}</div>
                    <div className="text-caption-1-regular text-text-tertiary">
                      DOB: {item.dob}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-body-2-medium text-text-primary">{item.primaryCondition}</div>
                    <div className="text-caption-1-regular text-text-tertiary">
                      {item.referringProvider}
                    </div>
                  </TableCell>

                  <TableCell>
                    <PriorityBadge priority={item.priority} />
                  </TableCell>

                  <TableCell>
                    <ExtractionBadge status={item.extractionStatus} />
                  </TableCell>

                  <TableCell>
                    <TriageBadge stage={item.triageStage} />
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end">
                      <Link
                        href={`/referrals/${item.id}`}
                        className="font-medium text-[#007aff] hover:underline"
                      >
                        Review Case &rarr;
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Table Footer with Summary & BoardUI Pagination */}
          <div className="flex flex-col gap-4 border-t border-[#e5e5e5] px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="shrink-0 text-caption-1-regular text-text-tertiary whitespace-nowrap">
              Showing <span className="font-medium text-text-primary">{startIndexDisplay}–{endIndexDisplay}</span> of{" "}
              <span className="font-medium text-text-primary">{filteredReferrals.length}</span> records
            </div>

            <div className="flex items-center justify-end">
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}