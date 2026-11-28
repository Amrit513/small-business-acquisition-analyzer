import {usd} from "@/lib/calculations/workbench";

export function sellerCompensationDisclosure(value:number|null):string {
  if(value===null)return "Seller compensation in SDE add-backs has not been entered. No separate seller-compensation amount is added by this model.";
  if(value===0)return "No seller compensation has been identified in SDE add-backs. The model does not add a separate seller-compensation amount.";
  return `Seller compensation identified in SDE add-backs is ${usd(value)}; it is already embedded in entered SDE and is not added again.`;
}
