import { describe, expect, it } from "vitest";
import { dealImportFailureMessage } from "@/lib/import/dealFailure";

describe("deal import recovery messages", () => {
  it("distinguishes the two recoverable file-boundary failures", () => {
    expect(dealImportFailureMessage(new Error("A deal file must be 256 KiB or smaller."))).toContain("must be 256 KiB or smaller");
    expect(dealImportFailureMessage(new Error("This file is not valid UTF-8 text."))).toContain("not valid UTF-8 text");
  });

  it.each([new Error("browser-internal C:\\private\\deal.json"), "unknown rejection", null])("does not expose an unrecognized failure: %o", error => {
    const message = dealImportFailureMessage(error);
    expect(message).toBe("Could not import this deal: it is not a supported Acquisition Lens deal export. Your current deal is unchanged.");
    expect(message).not.toContain("browser-internal");
    expect(message).not.toContain("private");
  });
});
