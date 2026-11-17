import { afterEach, expect, it, vi } from "vitest";
import { POST } from "./route";
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
it("does not forward data even if a previously configured cloud key exists", async () => {
  const transport = vi.fn(); vi.stubGlobal("fetch", transport); vi.stubEnv("GEMINI_API_KEY", "unused-test-value");
  const response = await POST();
  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(transport).not.toHaveBeenCalled();
});
