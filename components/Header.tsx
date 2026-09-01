'use client';

import Image from 'next/image';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  lastUpdated: string | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function Header({ lastUpdated, isLoading, onRefresh }: HeaderProps) {
  const formattedTime = lastUpdated
    ? new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date(lastUpdated))
    : null;

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-logo">
          <Image
            src="/assets/logo.png"
            alt="Ralsha logo"
            width={32}
            height={32}
            priority
          />
          <span className="site-logo-name">RALSHA</span>
        </div>

        <div style={{ flex: 1, paddingLeft: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-subtle)' }}>
            Leads Dashboard
          </span>
        </div>

        <div className="header-right">
          <span className="header-tz-label">Asia/Kolkata</span>

          {formattedTime ? (
            <span className="last-updated">
              Updated {formattedTime}
            </span>
          ) : (
            <span className="last-updated" style={{ fontStyle: 'italic' }}>
              Not updated yet
            </span>
          )}

          <button
            className={`btn-refresh ${isLoading ? 'spinning' : ''}`}
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh dashboard data"
          >
            <RefreshCw size={14} aria-hidden="true" />
            {isLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>
    </header>
  );
}
