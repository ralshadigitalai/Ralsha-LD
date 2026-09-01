import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = 'No touchpoints found for the selected period.' }: EmptyStateProps) {
  return (
    <div className="state-container">
      <Inbox className="state-icon" strokeWidth={1.5} />
      <h2 className="state-title">No Data</h2>
      <p className="state-message">{message}</p>
    </div>
  );
}
