import { NextResponse } from "next/server";

/** Cloud AI is unavailable in this release. No submitted financial data is forwarded. */
export async function POST() {
  return NextResponse.json(
    { error: "Cloud AI review is unavailable in this release. Use the local financial model and diligence checklist." },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}
