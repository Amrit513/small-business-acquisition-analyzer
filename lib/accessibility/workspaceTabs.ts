export type WorkspaceView = "inputs" | "results" | "compare";
export type WorkspaceTabKey = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Home" | "End";

/** Resolve keyboard movement without touching the DOM so disabled tabs are consistently skipped. */
export function nextWorkspaceView(
  current: WorkspaceView,
  key: string,
  resultsEnabled: boolean,
): WorkspaceView | undefined {
  const enabled: WorkspaceView[] = resultsEnabled
    ? ["inputs", "results", "compare"]
    : ["inputs", "compare"];
  if (!isWorkspaceTabKey(key)) return undefined;
  if (key === "Home") return enabled[0];
  if (key === "End") return enabled[enabled.length - 1];

  const currentIndex = Math.max(0, enabled.indexOf(current));
  const direction = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
  return enabled[(currentIndex + direction + enabled.length) % enabled.length];
}

function isWorkspaceTabKey(key: string): key is WorkspaceTabKey {
  return ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(key);
}
