export type JsonDownloadEnvironment = {
  createObjectUrl: (blob: Blob) => string;
  revokeObjectUrl: (url: string) => void;
  createAnchor: () => Pick<HTMLAnchorElement, "href" | "download" | "click">;
  schedule: (work: () => void, delay: number) => void;
};

function browserEnvironment(): JsonDownloadEnvironment {
  return {
    createObjectUrl: blob => URL.createObjectURL(blob),
    revokeObjectUrl: url => URL.revokeObjectURL(url),
    createAnchor: () => document.createElement("a"),
    schedule: (work, delay) => { window.setTimeout(work, delay); },
  };
}

function safelyRevoke(environment: JsonDownloadEnvironment, url: string) {
  try { environment.revokeObjectUrl(url); } catch { /* The download has already been handed to the browser. */ }
}

/** Keep imported record IDs intact while preventing them from becoming unsafe filenames. */
export function dealDownloadName(id: string, extension: "json" | "pdf"): string {
  const stem = id.normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 80)
    .replace(/[.-]+$/g, "");
  return `acquisition-lens-${stem || "deal"}.${extension}`;
}

export function downloadJson(raw: string, name: string, environment = browserEnvironment()) {
  let url: string | undefined;
  let anchor: Pick<HTMLAnchorElement, "href" | "download" | "click">;
  try {
    url = environment.createObjectUrl(new Blob([raw], { type: "application/json" }));
    anchor = environment.createAnchor();
    anchor.href = url;
    anchor.download = name;
  } catch {
    if (url) safelyRevoke(environment, url);
    throw new Error("Could not prepare the JSON download on this device. Keep the deal open and try again.");
  }

  try { anchor.click(); }
  catch {
    safelyRevoke(environment, url);
    throw new Error("Could not start the JSON download. Keep the deal open and try again.");
  }
  environment.schedule(() => safelyRevoke(environment, url), 30_000);
}
