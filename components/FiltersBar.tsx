'use client';

import { useEffect, useRef, useState } from 'react';
import type { SafeTouchpoint } from '@/lib/schemas/backend.schema';
import { Search, X } from 'lucide-react';

interface FiltersBarProps {
  items: SafeTouchpoint[];
  isLoading: boolean;
  onFiltered: (filtered: SafeTouchpoint[]) => void;
}

export default function FiltersBar({ items, isLoading, onFiltered }: FiltersBarProps) {
  const [search, setSearch] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive distinct filter options from current page
  const sources = Array.from(new Set(items.map((i) => i.utm_source).filter(Boolean))) as string[];
  const campaigns = Array.from(new Set(items.map((i) => i.utm_campaign).filter(Boolean))) as string[];

  const applyFilters = (
    s: string,
    src: string,
    camp: string,
    sort: 'newest' | 'oldest'
  ) => {
    // Escape special regex chars in search term
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'i');

    let filtered = [...items];

    if (s.trim()) {
      filtered = filtered.filter(
        (i) =>
          re.test(i.name ?? '') ||
          re.test(i.email ?? '') ||
          re.test(i.phone ?? '')
      );
    }

    if (src) {
      filtered = filtered.filter((i) => i.utm_source === src);
    }

    if (camp) {
      filtered = filtered.filter((i) => i.utm_campaign === camp);
    }

    filtered.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sort === 'newest' ? bTime - aTime : aTime - bTime;
    });

    onFiltered(filtered);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      applyFilters(value, utmSource, utmCampaign, sortOrder);
    }, 300);
  };

  useEffect(() => {
    applyFilters(search, utmSource, utmCampaign, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, utmSource, utmCampaign, sortOrder]);

  const handleClear = () => {
    setSearch('');
    setUtmSource('');
    setUtmCampaign('');
    setSortOrder('newest');
    onFiltered([...items].sort((a, b) => {
      const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bt - at;
    }));
  };

  const hasFilters = search || utmSource || utmCampaign || sortOrder !== 'newest';

  return (
    <div className="filters-bar" role="search" aria-label="Filter current page touchpoints">
      {/* Search */}
      <div className="filter-group" style={{ minWidth: 220 }}>
        <label className="filter-label" htmlFor="page-search">
          Search Current Page
        </label>
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-subtle)',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />
          <input
            id="page-search"
            className="filter-input"
            style={{ paddingLeft: 30 }}
            type="search"
            placeholder="Name, email, phone…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isLoading}
            aria-label="Search name, email or phone on current page"
          />
        </div>
      </div>

      {/* UTM Source */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-source">
          Filter Current Page — Source
        </label>
        <select
          id="filter-source"
          className="filter-select"
          value={utmSource}
          onChange={(e) => setUtmSource(e.target.value)}
          disabled={isLoading}
        >
          <option value="">All Sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* UTM Campaign */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="filter-campaign">
          Filter Current Page — Campaign
        </label>
        <select
          id="filter-campaign"
          className="filter-select"
          value={utmCampaign}
          onChange={(e) => setUtmCampaign(e.target.value)}
          disabled={isLoading}
        >
          <option value="">All Campaigns</option>
          {campaigns.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="sort-order">
          Sort Current Page
        </label>
        <select
          id="sort-order"
          className="filter-select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
          disabled={isLoading}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Clear */}
      <div className="filter-actions">
        <button
          className="btn-clear"
          onClick={handleClear}
          disabled={!hasFilters || isLoading}
          aria-label="Clear all filters"
        >
          <X size={13} style={{ display: 'inline', marginRight: 4 }} aria-hidden="true" />
          Clear Filters
        </button>
      </div>
    </div>
  );
}
