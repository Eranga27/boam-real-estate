import { NextResponse } from 'next/server';
import { PRODUCTION_BACKEND_URL } from '@/lib/api';

/**
 * Lightweight endpoint to keep Render backend container awake and warm.
 * Can be called by uptime monitors (UptimeRobot, Cron-job.org).
 * The scheduled keep-alive runs in .github/workflows/keep-backend-awake.yml instead of
 * Vercel Cron, because the Hobby plan rejects deployments with sub-daily cron jobs.
 */
export async function GET() {
  const startTime = Date.now();
  try {
    // Health route: wakes the server without querying (and waking) the database
    const res = await fetch(`${PRODUCTION_BACKEND_URL}/api/v1/health`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    const duration = Date.now() - startTime;
    return NextResponse.json({
      status: 'ok',
      backendStatus: res.status,
      latencyMs: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Ping failed',
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}
