import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.json({ members: [] });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ success: true });
}
