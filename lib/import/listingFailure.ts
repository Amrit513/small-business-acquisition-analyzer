const unchanged = " Your current listing review is unchanged.";

/** Convert known local listing-import failures into stable recovery copy. */
export function listingImportFailureMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("12 KB")) return "Could not import this listing: the file must be 12 KB or smaller." + unchanged;
  if (message.includes("not valid UTF-8")) return "Could not import this listing: the file is not valid UTF-8 text." + unchanged;
  return "Could not import this listing: it is not a supported Acquisition Lens listing export." + unchanged;
}
