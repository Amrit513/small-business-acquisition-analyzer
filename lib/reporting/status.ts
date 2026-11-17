import type {Result} from "@/lib/calculations/workbench";

type ReportingStatus=Pick<Result,"ready"|"issues"|"linked">;

export function modelScreenStatus(result:ReportingStatus):string {
  if(result.ready)return "Complete model screen";
  const count=result.issues.length;
  return `Incomplete model screen · ${count} unresolved issue${count===1?"":"s"}`;
}

export function sourceNoteStatus(result:ReportingStatus):string {
  const count=result.linked.length;
  return count===0?"No current source-note links":`${count} current source-note link${count===1?"":"s"}`;
}
