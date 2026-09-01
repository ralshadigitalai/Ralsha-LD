import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-container">
      <AlertTriangle className="state-icon" strokeWidth={1.5} style={{ color: 'var(--state-error)' }} />
      <h2 className="state-title">Unable to load data</h2>
      <div className="state-error-box" role="alert">
        {message}
      </div>
      {onRetry && (
        <button className="btn-retry" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
