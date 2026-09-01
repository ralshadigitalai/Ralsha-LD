import { NextRequest, NextResponse } from 'next/server';
import { DashboardQuerySchema } from '@/lib/schemas/query.schema';
import { fetchLeads } from '@/lib/api/ralsha-client';

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
};

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Extract and strictly validate query parameters
  const searchParams = req.nextUrl.searchParams;

  const rawParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    rawParams[key] = value;
  });

  const validated = DashboardQuerySchema.safeParse(rawParams);

  if (!validated.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters.',
          issues: validated.error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const result = await fetchLeads(validated.data);

    return NextResponse.json(
      { success: true, ...result },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';

    const isTimeout = message.includes('timed out');
    const isNotFound = message.includes('not set');

    return NextResponse.json(
      { success: false, error: { code: 'UPSTREAM_ERROR', message } },
      {
        status: isNotFound ? 503 : isTimeout ? 504 : 502,
        headers: NO_STORE_HEADERS,
      }
    );
  }
}
