export type WorkspaceTabKey = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Home" | "End";

/** Resolve roving-tab movement without touching the DOM. */
export function nextWorkspaceTabIndex(current:number,key:string,count:number):number|undefined {
  if(!isWorkspaceTabKey(key)||!Number.isInteger(current)||!Number.isInteger(count)||count<1||current<0||current>=count)return undefined;
  if(key==="Home")return 0;
  if(key==="End")return count-1;
  const direction=key==="ArrowRight"||key==="ArrowDown"?1:-1;
  return (current+direction+count)%count;
}

function isWorkspaceTabKey(key: string): key is WorkspaceTabKey {
  return ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(key);
}
