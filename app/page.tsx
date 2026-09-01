'use client';

import { useState, useEffect, useRef } from 'react';
import type { SafeTouchpoint, SafeLeadsResponse } from '@/lib/schemas/backend.schema';
import type { RangePreset } from '@/components/TimeControls';
import Header from '@/components/Header';
import TimeControls from '@/components/TimeControls';
import SummaryCards from '@/components/SummaryCards';
import FiltersBar from '@/components/FiltersBar';
import LeadsTable from '@/components/LeadsTable';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

type LoadState = 'idle' | 'loading' | 'error' | 'success';

function todayIST(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

export default function DashboardPage() {
  const [range, setRange] = useState<RangePreset>('today');
  const [startDate, setStartDate] = useState(todayIST);
  const [endDate, setEndDate] = useState(todayIST);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<SafeLeadsResponse | null>(null);
  const [filteredItems, setFilteredItems] = useState<SafeTouchpoint[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Race-condition protection
  const fetchSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  // Refresh trigger counter — incrementing this triggers the effect
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    // Abort previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    fetchSeqRef.current += 1;
    const mySeq = fetchSeqRef.current;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadState('loading');
    setErrorMessage(null);

    const qs = new URLSearchParams({
      range,
      timezone: 'Asia/Kolkata',
      page: String(page),
      limit: String(limit),
    });
    if (range === 'custom') {
      qs.set('startDate', startDate);
      qs.set('endDate', endDate);
    }

    fetch(`/api/leads?${qs.toString()}`, { signal: controller.signal })
      .then((res) => res.json().then((json: unknown) => ({ res, json })))
      .then(({ res, json }: { res: Response; json: unknown }) => {
        if (mySeq !== fetchSeqRef.current) return;
        const j = json as Record<string, unknown>;
        if (!res.ok || !j['success']) {
          const errObj = j?.['error'] as Record<string, string> | undefined;
          const errMsg = errObj?.['message'] ?? `Request failed (${res.status})`;
          setErrorMessage(errMsg);
          setLoadState('error');
          return;
        }
        const result: SafeLeadsResponse = {
          data: (j['data'] as SafeTouchpoint[]) ?? [],
          pagination: j['pagination'] as SafeLeadsResponse['pagination'],
        };
        setData(result);
        setFilteredItems(result.data);
        setLastUpdated(new Date().toISOString());
        setLoadState('success');
        setErrorMessage(null);
      })
      .catch((err: unknown) => {
        if (mySeq !== fetchSeqRef.current) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setErrorMessage(msg);
        setLoadState('error');
      });

    return () => { controller.abort(); };
  }, [range, startDate, endDate, page, limit, refreshCount]);

  const handleRangeChange = (newRange: RangePreset, start?: string, end?: string) => {
    setRange(newRange);
    if (newRange === 'custom' && start && end) {
      setStartDate(start);
      setEndDate(end);
    }
    setPage(1);
  };

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleLimitChange = (newLimit: number) => { setLimit(newLimit); setPage(1); };
  const handleRefresh = () => setRefreshCount((c) => c + 1);

  const isLoading = loadState === 'loading';

  return (
    <>
      <Header
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      <main className="dashboard-content">
        <TimeControls
          activeRange={range}
          startDate={startDate}
          endDate={endDate}
          isLoading={isLoading}
          onRangeChange={handleRangeChange}
        />

        {loadState === 'idle' || (loadState === 'loading' && !data) ? (
          <LoadingSkeleton />
        ) : loadState === 'error' && !data ? (
          <ErrorState
            message={errorMessage ?? 'Failed to load lead touchpoints.'}
            onRetry={handleRefresh}
          />
        ) : (
          <>
            {loadState === 'error' && data && (
              <div className="state-error-box" role="alert" style={{ marginBottom: 16 }}>
                Refresh failed: {errorMessage}
              </div>
            )}

            {data && (
              <>
                <SummaryCards
                  items={data.data}
                  totalInPeriod={data.pagination.total}
                />

                <FiltersBar
                  items={data.data}
                  isLoading={isLoading}
                  onFiltered={setFilteredItems}
                />

                <LeadsTable
                  items={filteredItems}
                  allItemsOnPage={data.data}
                  pagination={data.pagination}
                  isLoading={isLoading}
                  currentPage={page}
                  currentLimit={limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
