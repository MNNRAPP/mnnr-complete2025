import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    widgets: [],
    lastUpdated: new Date().toISOString()
  });
}
