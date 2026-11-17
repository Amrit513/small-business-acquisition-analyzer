export type EvidenceLevel = "unverified" | "listing" | "seller-provided" | "document-supported";
export type EvidenceField = "purchasePrice" | "annualRevenue" | "sde" | "ebitda" | "currentExpenses" | "ownerSalary";
export type EvidenceMap = Record<EvidenceField, EvidenceLevel>;

export const defaultEvidence: EvidenceMap = {
  purchasePrice: "listing", annualRevenue: "unverified", sde: "unverified",
  ebitda: "unverified", currentExpenses: "unverified", ownerSalary: "unverified",
};

export const evidenceOptions: Array<{ value: EvidenceLevel; label: string }> = [
  { value: "unverified", label: "Unverified assumption" },
  { value: "listing", label: "Marketplace listing" },
  { value: "seller-provided", label: "Seller-provided record" },
  { value: "document-supported", label: "Supported by source documents" },
];

export function normalizeEvidence(value?: Partial<EvidenceMap>): EvidenceMap {
  const allowed = new Set<EvidenceLevel>(evidenceOptions.map((option) => option.value));
  return Object.fromEntries((Object.keys(defaultEvidence) as EvidenceField[]).map((field) => [field, value?.[field] && allowed.has(value[field]!) ? value[field]! : defaultEvidence[field]])) as EvidenceMap;
}

export function summarizeEvidence(evidence: EvidenceMap) {
  const entries = Object.values(evidence);
  const documentSupported = entries.filter((level) => level === "document-supported").length;
  const sellerProvided = entries.filter((level) => level === "seller-provided").length;
  return { documentSupported, sellerProvided, total: entries.length, label: documentSupported === entries.length ? "All key fields document-supported" : `${documentSupported}/${entries.length} key fields document-supported` };
}
