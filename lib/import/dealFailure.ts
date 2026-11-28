const unchanged = " Your current deal is unchanged.";

/** Convert known local deal-import failures into stable recovery copy. */
export function dealImportFailureMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("256 KiB")) return "Could not import this deal: the file must be 256 KiB or smaller." + unchanged;
  if (message.includes("not valid UTF-8")) return "Could not import this deal: the file is not valid UTF-8 text." + unchanged;
  return "Could not import this deal: it is not a supported Acquisition Lens deal export." + unchanged;
}
