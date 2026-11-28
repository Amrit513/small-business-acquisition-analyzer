const MAX_JSON_NESTING_DEPTH=100;

function rejectDuplicateProperties(document:string):void {
  let at=0;
  const whitespace=()=>{while(/\s/.test(document[at]??""))at++;};
  const fail=(message:string):never=>{throw new SyntaxError(message);};
  const readString=():string=>{
    if(document[at]!=="\"")return fail("Invalid JSON property name.");
    const start=at++;
    while(at<document.length){
      if(document[at]==="\\"){at+=2;continue;}
      if(document[at]==="\""){at++;return JSON.parse(document.slice(start,at)) as string;}
      at++;
    }
    return fail("Unterminated JSON string.");
  };
  const readValue=(depth:number):void=>{
    if(depth>MAX_JSON_NESTING_DEPTH)return fail("JSON nesting is too deep.");
    whitespace();
    if(document[at]==="{"){readObject(depth+1);return;}
    if(document[at]==="["){readArray(depth+1);return;}
    if(document[at]==="\""){readString();return;}
    const start=at;
    while(at<document.length&&!/[\s,\]}]/.test(document[at]??""))at++;
    if(start===at)return fail("Invalid JSON value.");
  };
  const readObject=(depth:number):void=>{
    at++;whitespace();
    if(document[at]==="}"){at++;return;}
    const keys=new Set<string>();
    while(at<document.length){
      whitespace();const key=readString();
      if(keys.has(key))return fail(`Duplicate JSON property: ${key}.`);
      keys.add(key);whitespace();
      if(document[at++]!==":")return fail("Invalid JSON object.");
      readValue(depth);whitespace();
      if(document[at]===","){at++;continue;}
      if(document[at]==="}"){at++;return;}
      return fail("Invalid JSON object.");
    }
    return fail("Unterminated JSON object.");
  };
  const readArray=(depth:number):void=>{
    at++;whitespace();
    if(document[at]==="]"){at++;return;}
    while(at<document.length){
      readValue(depth);whitespace();
      if(document[at]===","){at++;continue;}
      if(document[at]==="]"){at++;return;}
      return fail("Invalid JSON array.");
    }
    return fail("Unterminated JSON array.");
  };
  readValue(0);whitespace();
  if(at!==document.length)fail("Invalid trailing JSON content.");
}

/**
 * Parse one strict JSON document while tolerating a single leading U+FEFF.
 * Duplicate object properties are rejected before JSON.parse can silently
 * replace an earlier financial value. Callers still enforce exact schemas.
 */
export function parseJsonDocument(raw:string):unknown {
  const document=raw.charCodeAt(0)===0xfeff?raw.slice(1):raw;
  rejectDuplicateProperties(document);
  return JSON.parse(document);
}
