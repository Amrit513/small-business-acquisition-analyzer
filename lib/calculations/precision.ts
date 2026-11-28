function shiftDecimal(value:number,places:number):number {
  const [coefficient,exponent="0"]=value.toString().toLowerCase().split("e");
  return Number(`${coefficient}e${Number(exponent)+places}`);
}

/** Round a finite decimal half away from zero so gains and losses are symmetric. */
export function roundDecimal(value:number,places:number):number {
  if(!Number.isFinite(value))return value;
  const sign=value<0?-1:1;
  const rounded=sign*shiftDecimal(Math.round(shiftDecimal(Math.abs(value),places)),-places);
  return rounded===0?0:rounded;
}

export const roundToCents=(value:number)=>roundDecimal(value,2);
