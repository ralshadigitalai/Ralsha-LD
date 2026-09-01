'use client';

import { useState, useCallback, useRef } from 'react';
import type { SafeTouchpoint } from '@/lib/schemas/backend.schema';
import { ChevronDown, ChevronUp } from 'lucide-react';
import LeadDetailsDrawer from './LeadDetailsDrawer';
import EmptyState from './EmptyState';

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface LeadsTableProps {
  items: SafeTouchpoint[];
  allItemsOnPage: SafeTouchpoint[];
  pagination: Pagination;
  isLoading: boolean;
  currentPage: number;
  currentLimit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="badge badge-direct">—</span>;
  const lower = status.toUpperCase();
  if (lower === 'ACTIVE') return <span className="badge badge-active">Active</span>;
  if (lower === 'ONHOLD') return <span className="badge badge-onhold">On Hold</span>;
  if (lower === 'DELETED') return <span className="badge badge-deleted">Deleted</span>;
  return <span className="badge badge-direct">{status}</span>;
}

const PAGE_SIZES = [10, 25, 50, 100];

export default function LeadsTable({
  items,
  allItemsOnPage,
  pagination,
  isLoading,
  currentPage,
  currentLimit,
  onPageChange,
  onLimitChange,
}: LeadsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expandButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const toggleExpand = useCallback(
    (id: string) => {
      setExpandedId((prev) => (prev === id ? null : id));
    },
    []
  );

  const handleClose = useCallback(
    (id: string) => {
      setExpandedId(null);
      // Restore focus to triggering button
      setTimeout(() => {
        expandButtonRefs.current.get(id)?.focus();
      }, 0);
    },
    []
  );

  if (!isLoading && items.length === 0) {
    return (
      <div className="table-container">
        <EmptyState message="No touchpoints match your current filters on this page." />
      </div>
    );
  }

  const start = (currentPage - 1) * currentLimit + 1;
  const end = Math.min(currentPage * currentLimit, pagination.total);

  // Build page number buttons (max 5 visible)
  const pageButtons = (() => {
    const total = pagination.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const near = [currentPage - 1, currentPage, currentPage + 1].filter(
      (p) => p >= 1 && p <= total
    );
    const pages = new Set([1, ...near, total]);
    return Array.from(pages).sort((a, b) => a - b);
  })();

  return (
    <div className="table-container">
      <div className="table-header">
        <div>
          <span className="table-title">Lead Touchpoints</span>
          <span className="table-count" style={{ marginLeft: 10 }}>
            {pagination.total.toLocaleString()} total in period
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label htmlFor="page-size" className="filter-label" style={{ marginBottom: 0 }}>
            Rows
          </label>
          <select
            id="page-size"
            className="page-size-select"
            value={currentLimit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            disabled={isLoading}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-scroll">
        <table aria-label="Lead Touchpoints" aria-busy={isLoading}>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Ad Spend</th>
              <th scope="col">Source / Campaign</th>
              <th scope="col">Status</th>
              <th scope="col">Touchpoint Date (IST)</th>
              <th scope="col">Details</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const rowNum = (currentPage - 1) * currentLimit + index + 1;
              const isExpanded = expandedId === item._id;
              const isReturning =
                allItemsOnPage.filter((i) => i.userId === item.userId).length > 1;

              return (
                <>
                  <tr key={item._id} className={isExpanded ? 'expanded' : ''}>
                    <td className="td-mono td-secondary">{rowNum}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontWeight: 500 }}>{item.name ?? '—'}</span>
                        {isReturning && (
                          <span className="badge badge-returning" style={{ fontSize: 10, width: 'fit-content' }}>
                            Returning
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="td-secondary">{item.email ?? '—'}</td>
                    <td className="td-mono td-secondary">{item.phone ?? '—'}</td>
                    <td>
                      {item.monthlyAdSpend ? (
                        <span style={{ fontSize: 12, color: 'var(--accent-gold)' }}>
                          {item.monthlyAdSpend}
                        </span>
                      ) : (
                        <span className="td-secondary">—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {item.utm_source ? (
                          <span className="badge badge-attributed">{item.utm_source}</span>
                        ) : (
                          <span className="badge badge-direct">Direct</span>
                        )}
                        {item.utm_campaign && (
                          <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                            {item.utm_campaign}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="td-mono td-secondary">
                      {formatDate(item.createdAt)}
                    </td>
                    <td>
                      <button
                        ref={(el) => {
                          if (el) expandButtonRefs.current.set(item._id, el);
                          else expandButtonRefs.current.delete(item._id);
                        }}
                        className="btn-expand"
                        onClick={() => toggleExpand(item._id)}
                        aria-expanded={isExpanded}
                        aria-controls={`details-${item._id}`}
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${item.name ?? 'lead'}`}
                      >
                        {isExpanded ? (
                          <><ChevronUp size={13} aria-hidden="true" /> Collapse</>
                        ) : (
                          <><ChevronDown size={13} aria-hidden="true" /> View</>
                        )}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <LeadDetailsDrawer
                      key={`details-${item._id}`}
                      touchpoint={item}
                      allItemsOnPage={allItemsOnPage}
                      onClose={() => handleClose(item._id)}
                    />
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <nav className="pagination" aria-label="Lead touchpoints pagination">
        <div className="pagination-info">
          Showing {start}–{end} of {pagination.total.toLocaleString()}
        </div>

        <div className="pagination-controls">
          <button
            className="btn-page"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            aria-label="Previous page"
          >
            ‹
          </button>

          {pageButtons.map((p, i) => {
            const prev = pageButtons[i - 1];
            const gap = prev && p - prev > 1;
            return (
              <>
                {gap && (
                  <span key={`ellipsis-${p}`} style={{ color: 'var(--text-subtle)', padding: '0 4px' }}>…</span>
                )}
                <button
                  key={p}
                  className={`btn-page ${p === currentPage ? 'active' : ''}`}
                  onClick={() => onPageChange(p)}
                  disabled={isLoading}
                  aria-label={`Page ${p}`}
                  aria-current={p === currentPage ? 'page' : undefined}
                >
                  {p}
                </button>
              </>
            );
          })}

          <button
            className="btn-page"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages || isLoading}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </nav>
    </div>
  );
}
