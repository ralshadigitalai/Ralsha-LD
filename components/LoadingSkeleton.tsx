export default function LoadingSkeleton() {
  return (
    <div className="dashboard-content" aria-busy="true" aria-label="Loading dashboard data">
      {/* Summary cards skeleton */}
      <div className="summary-cards" style={{ marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-line" style={{ width: '60%', marginBottom: 12 }} />
            <div className="skeleton skeleton-line" style={{ width: '40%', height: 28, marginBottom: 8 }} />
            <div className="skeleton skeleton-line" style={{ width: '80%', height: 10 }} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
          <div className="skeleton skeleton-line" style={{ width: 180, height: 16 }} />
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 16,
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div className="skeleton skeleton-line" style={{ width: 30, flexShrink: 0 }} />
            <div className="skeleton skeleton-line" style={{ width: 120 }} />
            <div className="skeleton skeleton-line" style={{ width: 160 }} />
            <div className="skeleton skeleton-line" style={{ width: 140 }} />
            <div className="skeleton skeleton-line" style={{ width: 90 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
