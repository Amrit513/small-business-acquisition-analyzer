import { normalizeEvidence, type EvidenceField, type EvidenceMap } from "@/lib/evidence/provenance";

export interface EvidenceReportRow {
  field: EvidenceField;
  label: string;
  sourceLabel: string;
  needsVerification: boolean;
}

const fieldLabels: Record<EvidenceField, string> = {
  purchasePrice: "Asking price",
  annualRevenue: "Annual revenue",
  sde: "Seller discretionary earnings",
  ebitda: "EBITDA",
  currentExpenses: "Operating expenses",
  ownerSalary: "Owner compensation",
};

const sourceLabels: Record<EvidenceMap[EvidenceField], string> = {
  unverified: "Unverified assumption",
  listing: "Marketplace listing",
  "seller-provided": "Seller-provided record",
  "document-supported": "Supported by source documents",
};

export function buildEvidenceReport(evidence?: Partial<EvidenceMap>): EvidenceReportRow[] {
  const normalized = normalizeEvidence(evidence);
  return (Object.keys(fieldLabels) as EvidenceField[]).map((field) => ({
    field,
    label: fieldLabels[field],
    sourceLabel: sourceLabels[normalized[field]],
    needsVerification: normalized[field] !== "document-supported",
  }));
}
