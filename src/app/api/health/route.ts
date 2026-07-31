import { NextResponse } from "next/server";

/** Uptime probe target for monitoring (UptimeRobot, BetterStack, Vercel checks). */
export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "monolith-web",
    timestamp: new Date().toISOString(),
  });
}
