import { NextResponse } from "next/server";

interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database?: "connected" | "disconnected";
    redis?: "connected" | "disconnected";
    api?: "operational" | "degraded";
  };
}

export const runtime = "edge";
export const dynamic = "force-dynamic";

const startTime = Date.now();

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  const healthCheck: HealthCheckResponse = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    environment: process.env.NODE_ENV || "development",
    uptime,
    checks: {
      api: "operational",
    },
  };

  return NextResponse.json(healthCheck, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function HEAD(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
