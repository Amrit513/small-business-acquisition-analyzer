import { describe, expect, it, vi } from "vitest";
import { downloadJson, type JsonDownloadEnvironment } from "@/lib/export/download";

function fixture(overrides: Partial<JsonDownloadEnvironment> = {}) {
  const anchor = { href: "", download: "", click: vi.fn() };
  const environment: JsonDownloadEnvironment = {
    createObjectUrl: vi.fn(() => "blob:deal-export"),
    revokeObjectUrl: vi.fn(),
    createAnchor: vi.fn(() => anchor),
    schedule: vi.fn(),
    ...overrides,
  };
  return { anchor, environment };
}

describe("local JSON downloads", () => {
  it("hands the JSON to the browser and schedules Blob URL cleanup", () => {
    const { anchor, environment } = fixture();
    downloadJson('{"schemaVersion":3}', "deal.json", environment);

    expect(anchor).toMatchObject({ href: "blob:deal-export", download: "deal.json" });
    expect(anchor.click).toHaveBeenCalledOnce();
    expect(environment.schedule).toHaveBeenCalledWith(expect.any(Function), 30_000);
    const cleanup = vi.mocked(environment.schedule).mock.calls[0]![0];
    cleanup();
    expect(environment.revokeObjectUrl).toHaveBeenCalledWith("blob:deal-export");
  });

  it("uses stable guidance when the browser cannot prepare a download", () => {
    const { environment } = fixture({ createObjectUrl: vi.fn(() => { throw new Error("browser-internal allocation error"); }) });
    expect(() => downloadJson("{}", "deal.json", environment)).toThrow("Could not prepare the JSON download on this device. Keep the deal open and try again.");
    expect(environment.createAnchor).not.toHaveBeenCalled();
  });

  it("revokes the Blob URL and hides raw browser errors when download cannot start", () => {
    const click = vi.fn(() => { throw new Error("browser-internal click error"); });
    const { environment } = fixture({ createAnchor: vi.fn(() => ({ href: "", download: "", click })) });
    expect(() => downloadJson("{}", "deal.json", environment)).toThrow("Could not start the JSON download. Keep the deal open and try again.");
    expect(environment.revokeObjectUrl).toHaveBeenCalledWith("blob:deal-export");
    expect(environment.schedule).not.toHaveBeenCalled();
  });
});
