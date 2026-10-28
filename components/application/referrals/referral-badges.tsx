// components/application/referrals/referral-badges.tsx
import React from "react";
import { Chip } from "@/components/base/badges/chip";
import type { ChipProps } from "@/components/base/badges/chip";
import { TriageStage, PriorityLevel, ExtractionStatus } from "@/types/referral";

type ChipColor = NonNullable<ChipProps["color"]>;
type ChipVariant = NonNullable<ChipProps["variant"]>;

export function TriageBadge({ stage }: { stage: TriageStage }) {
  const stageMap: Record<TriageStage, { color: ChipColor; variant: ChipVariant }> = {
    "Ready for Matching": { color: "lime", variant: "caption" },
    "Pending Review": { color: "yellow", variant: "caption" },
    Matched: { color: "blue", variant: "caption" },
    "On Hold": { color: "gray", variant: "caption" },
  };

  const current = stageMap[stage] ?? { color: "neutral", variant: "caption" };

  return (
    <Chip variant={current.variant} color={current.color}>
      {stage}
    </Chip>
  );
}

export function PriorityBadge({ priority }: { priority: PriorityLevel }) {
    switch (priority) {
      case "Urgent":
        return (
          <Chip variant="bold" color="rose">
            {priority}
          </Chip>
        );
      case "High":
        return (
          <Chip variant="bold" color="orange">
            {priority}
          </Chip>
        );
      case "Standard":
      default:
        // Uses the BoardUI "cyan" chip styled as "Priority"
        return (
          <Chip variant="bold" color="cyan">
            Priority
          </Chip>
        );
    }
  }

export function ExtractionBadge({ status }: { status: ExtractionStatus }) {
  const styles: Record<ExtractionStatus, { dot: string; text: string }> = {
    Extracted: { dot: "bg-emerald-500", text: "text-emerald-700" },
    Processing: { dot: "bg-blue-500 animate-pulse", text: "text-blue-700" },
    "Needs Review": { dot: "bg-amber-500", text: "text-amber-700" },
  };

  const current = styles[status] ?? { dot: "bg-gray-400", text: "text-text-tertiary" };

  return (
    <div className="inline-flex items-center gap-1.5 font-medium">
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      <span className={`text-caption-1-medium ${current.text}`}>{status}</span>
    </div>
  );
}