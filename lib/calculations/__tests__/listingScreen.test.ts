import { expect, it } from "vitest";
import { screenListing } from "../listingScreen";
it("screens reported ratios without treating missing values as zero", () => {
  expect(screenListing({ purchasePrice: 400000, sde: 100000, annualRevenue: 500000 })).toEqual({ askingToSde: 4, sdeMargin: .2 });
  expect(screenListing({ purchasePrice: 400000 })).toEqual({ askingToSde: null, sdeMargin: null });
  expect(screenListing({ purchasePrice: 400000, sde: 0, annualRevenue: 500000 })).toEqual({ askingToSde: null, sdeMargin: 0 });
  expect(screenListing({ purchasePrice: Infinity, sde: -1 })).toEqual({ askingToSde: null, sdeMargin: null });
});
