import { BackendSuccessResponseSchema, mapToSafeDTO, type SafeLeadsResponse } from '@/lib/schemas/backend.schema';
import type { DashboardQuery } from '@/lib/schemas/query.schema';

const TIMEOUT_MS = 8000;

function getBaseUrl(): string {
  const raw = process.env.RALSHA_BACKEND_API_URL;
  if (!raw) {
    throw new Error('RALSHA_BACKEND_API_URL environment variable is not set.');
  }
  // Normalize: strip trailing slashes to prevent double slashes in URLs
  return raw.replace(/\/+$/, '');
}

function buildBackendUrl(query: DashboardQuery): string {
  const base = getBaseUrl();
  const params = new URLSearchParams();

  if (query.range) params.set('range', query.range);
  if (query.startDate) params.set('startDate', query.startDate);
  if (query.endDate) params.set('endDate', query.endDate);
  if (query.timezone) params.set('timezone', query.timezone);
  params.set('page', String(query.page ?? 1));
  params.set('limit', String(query.limit ?? 10));

  return `${base}/api/user-details?${params.toString()}`;
}

export async function fetchLeads(query: DashboardQuery): Promise<SafeLeadsResponse> {
  const url = buildBackendUrl(query);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Backend request timed out. Please try again.');
    }
    throw new Error('Failed to reach the Ralsha backend. Please check your network.');
  } finally {
    clearTimeout(timeoutId);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error('Backend returned a malformed response. Please try again.');
  }

  if (!res.ok) {
    // Sanitize backend error — never expose raw error details
    const code = res.status;
    if (code === 400) {
      throw new Error('Invalid query parameters were sent to the backend.');
    }
    throw new Error(`Backend returned an error (${code}). Please try again later.`);
  }

  const parsed = BackendSuccessResponseSchema.safeParse(json);
  if (!parsed.success) {
    // Schema mismatch — do not expose Zod or backend internals
    throw new Error('Backend response did not match the expected format.');
  }

  const { data: items, pagination } = parsed.data.data;

  return {
    data: items.map(mapToSafeDTO),
    pagination,
  };
}
