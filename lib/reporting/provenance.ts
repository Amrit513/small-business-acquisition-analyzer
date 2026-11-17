import type { Evidence } from "@/lib/workspace/deal";

export function evidenceMetadata(entry: Pick<Evidence, "location" | "period" | "date">) {
  return {
    location: entry.location.trim() || "Location not recorded",
    period: entry.period.trim() || "Period not recorded",
    date: entry.date.trim() || "Date not recorded",
  };
}
