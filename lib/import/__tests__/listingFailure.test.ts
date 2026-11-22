import { describe, expect, it } from "vitest";
import { listingImportFailureMessage } from "@/lib/import/listingFailure";

describe("listing import recovery copy", () => {
  it("gives specific recovery guidance for supported file failures", () => {
    expect(listingImportFailureMessage(new Error("Listing files must be 12 KB or smaller."))).toBe(
      "Could not import this listing: the file must be 12 KB or smaller. Your current listing review is unchanged.",
    );
    expect(listingImportFailureMessage(new Error("This file is not valid UTF-8 text."))).toBe(
      "Could not import this listing: the file is not valid UTF-8 text. Your current listing review is unchanged.",
    );
  });

  it.each([
    new SyntaxError("Unexpected token at C:\\private\\listing.json"),
    "browser-internal failure",
    null,
  ])("hides unsupported parser and platform details from %p", error => {
    const message = listingImportFailureMessage(error);
    expect(message).toBe(
      "Could not import this listing: it is not a supported Acquisition Lens listing export. Your current listing review is unchanged.",
    );
    expect(message).not.toMatch(/unexpected token|private|browser-internal/i);
  });
});
