'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console only — never expose to user
    console.error('[Dashboard error boundary]', error.digest ?? 'no-digest');
  }, [error]);

  return (
    <div className="state-container" style={{ minHeight: '100vh' }}>
      <div className="state-icon" style={{ fontSize: 48 }}>⚠️</div>
      <h2 className="state-title">Something went wrong</h2>
      <p className="state-message">
        An unexpected error occurred. Please try again.
      </p>
      <button className="btn-retry" onClick={reset}>
        Try Again
      </button>
    </div>
  );
}
