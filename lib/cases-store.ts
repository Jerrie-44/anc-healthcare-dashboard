// lib/cases-store.ts
import { CaseIntakeRecord } from "@/types/cases-intake";

const STORAGE_KEY = "anc_cases_intake_records";
const RECENT_KEY = "anc_recently_validated_ids";

export function getStoredCases(): CaseIntakeRecord[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredCases(cases: CaseIntakeRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export function upsertValidatedCases(newCases: CaseIntakeRecord[]): void {
  if (typeof window === "undefined") return;

  const current = getStoredCases();
  const map = new Map<string, CaseIntakeRecord>();

  current.forEach((c) => map.set(c.id, c));
  newCases.forEach((c) => map.set(c.id, c));

  const merged = Array.from(map.values());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  localStorage.setItem(RECENT_KEY, JSON.stringify(newCases.map((c) => c.id)));
}

export function popRecentlyValidatedIds(): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(RECENT_KEY);
  if (!raw) return [];
  localStorage.removeItem(RECENT_KEY);
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}