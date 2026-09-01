import type { SafeTouchpoint } from '@/lib/schemas/backend.schema';

interface SummaryCardsProps {
  items: SafeTouchpoint[];
  totalInPeriod: number;
}

export default function SummaryCards({ items, totalInPeriod }: SummaryCardsProps) {
  const uniqueLeadsOnPage = new Set(items.map((i) => i.userId)).size;

  const attributedOnPage = items.filter(
    (i) => i.utm_source && i.utm_source.trim().length > 0
  ).length;

  const topSourceOnPage = (() => {
    const freq: Record<string, number> = {};
    for (const item of items) {
      if (item.utm_source) {
        freq[item.utm_source] = (freq[item.utm_source] ?? 0) + 1;
      }
    }
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? '—';
  })();

  const cards = [
    {
      label: 'Touchpoints in Selected Period',
      value: totalInPeriod.toLocaleString(),
      sub: 'From backend pagination total',
      accent: 'orange' as const,
    },
    {
      label: 'Unique Leads on Current Page',
      value: uniqueLeadsOnPage.toLocaleString(),
      sub: `Out of ${items.length} touchpoints on page`,
      accent: 'cyan' as const,
    },
    {
      label: 'Attributed on Current Page',
      value: attributedOnPage.toLocaleString(),
      sub: 'Touchpoints with UTM source',
      accent: 'gold' as const,
    },
    {
      label: 'Top Source on Current Page',
      value: topSourceOnPage,
      sub: 'Most frequent utm_source',
      accent: 'muted' as const,
    },
  ];

  return (
    <div className="summary-cards" role="region" aria-label="Page summary metrics">
      {cards.map((card) => (
        <div key={card.label} className="summary-card">
          <div className={`summary-card-accent ${card.accent}`} />
          <div className="summary-card-label">{card.label}</div>
          <div className="summary-card-value">{card.value}</div>
          <div className="summary-card-sub">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
