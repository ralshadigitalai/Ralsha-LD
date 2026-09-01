import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="state-container" style={{ minHeight: '100vh' }}>
      <div className="state-icon" style={{ fontSize: 48, lineHeight: 1 }}>🔍</div>
      <h1 className="state-title">Page Not Found</h1>
      <p className="state-message">The page you are looking for does not exist.</p>
      <Link href="/" className="btn-retry" style={{ marginTop: 16, display: 'inline-block', padding: '9px 20px', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)', fontSize: 13, fontWeight: 600 }}>
        Go to Dashboard
      </Link>
    </div>
  );
}
