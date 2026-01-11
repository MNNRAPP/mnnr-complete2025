import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: { ok: true, timestamp: new Date().toISOString() },
    summary: { totalCosts: 0, totalAgents: 0, totalRequests: 0, averageLatency: 0 },
    trends: { costs: [], usage: [], errors: [] },
    topAgents: [],
    recentActivity: []
  });
}
