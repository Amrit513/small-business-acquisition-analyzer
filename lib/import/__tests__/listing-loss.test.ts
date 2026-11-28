import {expect,it} from "vitest";
import {extractListing,listingFragment,listingFromFragment} from "../listing";
import {screenListing} from "@/lib/calculations/listingScreen";
it("does not strip a minus sign when a label has no colon",()=>{const d=extractListing("SDE -$12k\nEBITDA: ($5k)\nAsking price -$3k\nAnnual Revenue: $100k");expect(d.values).toEqual({sde:-12000,ebitda:-5000,annualRevenue:100000});expect(screenListing(d.values)).toEqual({askingToSde:null,sdeMargin:-.12});expect(listingFromFragment(listingFragment(d))?.values.sde).toBe(-12000);});
