'use client';

import { useState } from 'react';

export type RangePreset = 'today' | 'yesterday' | '7days' | '1month' | 'custom';

interface TimeControlsProps {
  activeRange: RangePreset;
  startDate: string;
  endDate: string;
  isLoading: boolean;
  onRangeChange: (range: RangePreset, start?: string, end?: string) => void;
}

const PRESETS: { label: string; value: RangePreset }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '1month' },
  { label: 'Custom', value: 'custom' },
];

const ISO_DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export default function TimeControls({
  activeRange,
  startDate,
  endDate,
  isLoading,
  onRangeChange,
}: TimeControlsProps) {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const [dateError, setDateError] = useState<string | null>(null);

  const handlePreset = (value: RangePreset) => {
    setDateError(null);
    if (value !== 'custom') {
      onRangeChange(value);
    } else {
      onRangeChange('custom');
    }
  };

  const handleApply = () => {
    setDateError(null);

    if (!ISO_DATE_RE.test(localStart)) {
      setDateError('Start date must be a valid YYYY-MM-DD date.');
      return;
    }
    if (!ISO_DATE_RE.test(localEnd)) {
      setDateError('End date must be a valid YYYY-MM-DD date.');
      return;
    }
    if (localStart > localEnd) {
      setDateError('Start date must be on or before end date.');
      return;
    }

    onRangeChange('custom', localStart, localEnd);
  };

  return (
    <div className="time-controls" role="group" aria-label="Time period selector">
      <div className="time-presets">
        {PRESETS.map(({ label, value }) => (
          <button
            key={value}
            className={`btn-preset ${activeRange === value ? 'active' : ''}`}
            onClick={() => handlePreset(value)}
            disabled={isLoading}
            aria-pressed={activeRange === value}
          >
            {label}
          </button>
        ))}
      </div>

      {activeRange === 'custom' && (
        <div className="custom-range">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label htmlFor="startDate" className="filter-label">
              From
            </label>
            <input
              id="startDate"
              type="text"
              className={`date-input ${dateError && !ISO_DATE_RE.test(localStart) ? 'invalid' : ''}`}
              placeholder="YYYY-MM-DD"
              value={localStart}
              onChange={(e) => setLocalStart(e.target.value)}
              disabled={isLoading}
              aria-label="Start date"
              aria-describedby={dateError ? 'date-error' : undefined}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label htmlFor="endDate" className="filter-label">
              To
            </label>
            <input
              id="endDate"
              type="text"
              className={`date-input ${dateError && !ISO_DATE_RE.test(localEnd) ? 'invalid' : ''}`}
              placeholder="YYYY-MM-DD"
              value={localEnd}
              onChange={(e) => setLocalEnd(e.target.value)}
              disabled={isLoading}
              aria-label="End date"
              aria-describedby={dateError ? 'date-error' : undefined}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ height: 19 }} />
            <button
              className="btn-apply"
              onClick={handleApply}
              disabled={isLoading}
            >
              Apply
            </button>
          </div>
          {dateError && (
            <p id="date-error" className="date-error" role="alert" style={{ width: '100%' }}>
              {dateError}
            </p>
          )}
        </div>
      )}

      <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 'auto', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
        Timezone: Asia/Kolkata
      </span>
    </div>
  );
}
