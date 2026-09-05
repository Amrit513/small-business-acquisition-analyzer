import type { ListingDraft } from "@/lib/import/listing";

/** These ratios screen reported claims; they do not estimate value or a deal score. */
export function screenListing(values: ListingDraft["values"]) {
  const valid = (value: number | undefined): value is number => value !== undefined && Number.isFinite(value) && value >= 0;
  return {
    askingToSde: valid(values.purchasePrice) && valid(values.sde) && values.sde > 0 ? values.purchasePrice / values.sde : null,
    sdeMargin: valid(values.sde) && valid(values.annualRevenue) && values.annualRevenue > 0 ? values.sde / values.annualRevenue : null,
  };
}
