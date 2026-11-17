export type WorkspaceAction={tab:"Deal inputs"|"Evidence"|"Scenarios";label:string};

const evidenceIssues=[
  "Explain the earnings bridge",
  "Review the assumptions and mark them reviewed",
] as const;

/** Route the displayed first issue to the workspace that can resolve it. */
export function nextWorkspaceAction(issue?:string):WorkspaceAction {
  if(!issue)return {tab:"Scenarios",label:"Open scenarios"};
  if(evidenceIssues.some(prefix=>issue.startsWith(prefix)))return {tab:"Evidence",label:"Review evidence"};
  return {tab:"Deal inputs",label:"Review deal inputs"};
}
