// lib/cases-store.ts
import { CaseIntakeRecord } from "@/types/cases-intake";
import { INITIAL_BATCHES } from "@/lib/cases-intake-service";

const STORAGE_KEY = "anc_cases_intake_records";
const RECENTLY_VALIDATED_KEY = "anc_recently_validated_ids";

export function getStoredCases(): CaseIntakeRecord[] {
  if (typeof window === "undefined") {
    return INITIAL_BATCHES.flatMap((b) => b.cases);
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const defaults = INITIAL_BATCHES.flatMap((b) => b.cases);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_BATCHES.flatMap((b) => b.cases);
  }
}

export function saveStoredCases(cases: CaseIntakeRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export function upsertValidatedCases(newCases: CaseIntakeRecord[]): void {
  const current = getStoredCases();
  const existingMap = new Map(current.map((c) => [c.id, c]));

  newCases.forEach((nc) => {
    existingMap.set(nc.id, nc);
  });

  const updated = Array.from(existingMap.values());
  saveStoredCases(updated);

  // Store recently validated IDs for brief highlight feedback
  if (typeof window !== "undefined") {
    const ids = newCases.filter((c) => c.status === "Validated").map((c) => c.id);
    sessionStorage.setItem(RECENTLY_VALIDATED_KEY, JSON.stringify(ids));
  }
}

export function popRecentlyValidatedIds(): string[] {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem(RECENTLY_VALIDATED_KEY);
  if (!raw) return [];
  sessionStorage.removeItem(RECENTLY_VALIDATED_KEY);
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}